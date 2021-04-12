const URL = "http://localhost:8000";

const fetch = require("../server").fetch;
const io = require("../server").io;

module.exports = {

    endPlayerTurn: function (game) {
        console.log("gameController.endPlayerTurn " + game.playerOrder);

        this.updatePlayerInfo(game);
    
        if (!game.state.includes("act")) {
            console.log(game.playerOrder[0] + " removed from game.playerOrder");
            game.playerOrder.shift();
        }

        // act subrounds
        if (game.state.includes("act")) {
            if (game.state == "act.attack") {
                console.log("act.attack -> act.move");
                game.state = "act.move";
            }
            else if (game.state == "act.move") {
                console.log("act.move -> act.build");
                game.state = "act.build";
            }
            // loop back to act.attack
            else if (game.state == "act.build") {
                console.log(game.playerOrder[0] + " removed from game.playerOrder");
                game.playerOrder.shift();
                console.log("act.build -> act.attack");
                game.state = "act.attack";
            }
        }

        // all players finished their turn
        if (game.playerOrder.length == 0) {
            if (game.state == "sell") {
                console.log("sell -> act.attack");
                game.state = "act.attack";
                this.updatePlayerOrder(game);  // for act
            }
            else if (game.state.includes("act")) {
                console.log("act.build -> buy");
                game.state = "buy";
                this.updatePlayerOrder(game);  // for buy
            }
            else if (game.state == "buy") {
                console.log("buy -> industrialzation");
                game.state = "industrialization";
                this.prepareNextRound(game);
                this.doIndustrializationPhase(game);
            }
        }
    },

    rotatePlayerOrder: function (game) {
        console.log("gameController.rotatePlayerOrder " + game.playerOrder);
        this.removeDeadPlayers(game);
        game.playerOrder.push(game.playerOrder.shift());
    },

    updatePlayerOrder: function (game) {
        console.log("gameController.updatePlayerOrder " + game.state);
        let state = game.state;
        if (state == "sell" || state.includes("act") || state == "buy") {
            let playerOrder = game._doc.players.sort((a, b) => {
                if (a.focus[state] > b.focus[state]) return -1;
                if (a.focus[state] < b.focus[state]) return 1;
                if (a.focus[state] == b.focus[state])
                    return Math.random() - 0.5;
            });
            let playerOrderIds = [];  // empty queue
            // add player._ids to game.playerOrder
            for (player of playerOrder) {
                console.log(`player._id: ${player._id}`);
                playerOrderIds.push(player._id);
            }
            this.removeDeadPlayers(game);
            game.playerOrder = playerOrderIds;
        }
    },

    removeDeadPlayers: function (game) {
        for (let i = 0; i < game.playerOrder.length; i++) {
            if (game.playerOrder[i].status == "dead")
                game.playerOrder.pop(i);
        }
    },

    // focus -> sell
    checkFocus: function (game) {
        console.log("gameController.checkFocus");
        let ready = true;
        for (player of game.players) {
            if (player.status == "dead") continue;
            let sum = 0;
            for (action in player._doc.focus) {
                sum += player._doc.focus[action];
                console.log(player._doc.focus[action]);
            }
            if (sum < 10) {
                ready = false;
                console.log("focus not ready");
                break;
            }
        }
        if (ready) {
            console.log("game state -> sell");
            game.state = "sell";
            this.updatePlayerOrder(game);
        }
    },

    updatePlayerIncome: function (game) {
        console.log("gameController.updatePlayerIncome");
        this.updateUnits(game);
        for (player of game.players) {
            player.unitFees = (player.units.land + player.units.naval + player.units.amphibious) * game._doc.market.costs.unitFee;
            console.log("Player unit fees: " + player.unitFees);
            for (resource in player._doc.resources) {
                player.incomingResources[resource] = 
                    game.regions.reduce((total, region) => 
                        total += typeof region.player != "undefined" && region.player.equals(player._id) ? 
                            region.industrialization[resource] : 0, 
                    0);
            }
            console.log("Player incomingResources: " + player.incomingResources);
        }
    },

    updateRegionTraverseCountDown: function (game) {
        console.log("gameController.updateRegions");
        // countdown for traverseCountdown
        for (region of game.regions) {
            if (region.traverseCountdown > 0) {
                region.traverseCountdown -= 1;
            }
        }
    },

    updateUnits: function (game) {
        console.log("gameController.updateUnits");
        console.log(game);
        // count units
        for (player of game.players) {
            for (unit in player._doc.units) {
                player.units[unit] = 0;
            }

            let regionCount = 0;
            for (region of game.regions) {
                if (typeof region.player != "undefined" && region.player.equals(player._id)) {
                    regionCount += 1;
                    for (unit in region._doc.units) {
                        player.units[unit] += region.units[unit];
                    }
                }
            }

            // players that have no money are dead
            if (player.balance <= 0) {
                console.log(player._id + " has no balance.");
                player.status = "dead";
            }

            // players that have no regions are dead
            if (regionCount < 1) {
                console.log(player._id + " has " + regionCount + " regions.");
                player.status = "dead";
            }

            // players that have no units are dead
            let playerHasNoUnits = true;
            for (unit in player._doc.units) {
                if (player.units[unit] > 0) {
                    playerHasNoUnits = false;
                    break;
                }
            }

            if (playerHasNoUnits) {
                console.log(player._id + " has no units " + player.units);
                player.status = "dead";
            }
        }

        this.removeDeadPlayers(game);
    },

    //  industrialization -> focus
    doIndustrializationPhase: function (game) {
        console.log("gameController.doIndustrializationPhase");

        // add incoming resources to players
        if (game.state == "industrialization" || game.state == "initialization" || game.state == "maintenance") {
            // apply fees and incoming resources          
            for (player of game.players) {
                console.log("Player balance: " + player.balance + " Player unitFees: " + player.unitFees);
                player.balance -= player.unitFees;
                for (resource in player.incomingResources) {
                    player.resources[resource] += player.incomingResources[resource];
                    if (player.resources[resource] > game.market.maxResources) {
                        player.resources[resource] = game.market.maxResources;
                    }
                }
            }

            // reset player focus
            for (player of game.players) {
                for (action in player._doc.focus) 
                    player.focus[action] = 0;
            }

            game.state = "focus";
            console.log("industrialization -> focus");

        }
        else { console.log("game.state is not industrialization or initialization, " + game.state); }
    },

    checkWinCondition: function (game) {
        console.log("gameController.checkWinCondition");
        let alivePlayers = game.players.filter(player => player.status == "alive");
        if (alivePlayers.length == 1) {
            game.state = "complete";
            game.playerOrder = [];
            game.playerOrder.push(...alivePlayers);
        }
    },

    updatePlayerInfo: function (game) {
        this.updateUnits(game);
        this.updatePlayerIncome(game);
        this.checkWinCondition(game);
        console.log(io);
        io.emit("updateGameApp");
    },

    prepareNextRound: function (game) {
        console.log("gameController.prepareNextRound");
        this.updatePlayerInfo(game);
        this.updateRegionTraverseCountDown(game);
        game.turn += 1;
    }

};