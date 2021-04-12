const Game = require("../models/Game");
const Map = require("../models/Map");
const User = require("../models/User");

const gameController = require("../controllers/gameController");

const router = require("express").Router();

router.route("/").get(async (req, res) => {
    console.log("GET player");
    res.json(await Player.find());
});

/**
 * Assign Player focus and update Game.state if all Players have gone
 * req.body.game: game._id
 * req.body.player: player._id
 * req.body.focusValues: [Number], ordered as "buy", "act", "sell"
 */
router.route("/focus").post(async (req, res) => {
    let game = await Game.findOne({ _id: req.body.game });

    if (game.state == "focus") {
        let player = game.players.filter(player => player._id == req.body.player)[0];
        player.focus = {
            sell: req.body.focusValues[0],
            act: req.body.focusValues[1],
            buy: req.body.focusValues[2]
        }

        gameController.checkFocus(game);

        gameController.updatePlayerInfo(game);
        game.save();

        res.json({
            player: player
        });
    }
    else { console.log("game.state is not focus, " + game.state); }
});

/**
 * req.body.game: game._id
 * req.body.player: player._id
 */
router.route("/end-turn").post(async (req, res) => {
    console.log("POST player/end-turn");
    let game = await Game.findOne({ _id: req.body.game });
    let player = game.players.filter(player => player._id == req.body.player)[0];

    if (game.playerOrder[0] == player._id) {
        gameController.endPlayerTurn(game);
        game.save();
        res.json({ message: "Player " + player._id + " turn ended" });
    }
    else {
        res.json({ message: "ERROR - incorrect action or player" });
    }
});

/**
 * req.body.game: game._id
 * req.body.player: player._id
 * req.body.resource: String, name of player.resources key
 * req.body.action: String, "buy" or "sell"
 * req.body.amount: Number
 */
router.route("/market-order").post(async (req, res) => {
    console.log("POST player/market-order");

    let game = await Game.findOne({ _id: req.body.game });
    let player = game.players.filter(player => player._id == req.body.player)[0];

    if (game.state == req.body.action && game.playerOrder[0] == player._id) {
        let price = req.body.amount * game._doc.market.prices[req.body.resource];
        console.log("price: " + price);
        if (req.body.action == "sell") {
            if (player._doc.resources[req.body.resource] - req.body.amount < 0) {
                res.json({ message: "ERROR - not enough resources" });
                return;
            }
            player.balance += price;
            player.resources[req.body.resource] -= req.body.amount;
            game.market.prices[req.body.resource] -= req.body.amount;
            console.log(game.market.prices[req.body.resource]);
            if (game.market.prices[req.body.resource] < 1)
                game.market.prices[req.body.resource] = 1;
            gameController.rotatePlayerOrder(game);
        }
        if (req.body.action == "buy") {
            if (player.balance - price < 0) {
                res.json({ message: "ERROR - balance too low" });
                return;
            }
            player.balance -= price;
            player.resources[req.body.resource] += req.body.amount;
            game.market.prices[req.body.resource] += req.body.amount;
            console.log(game.market.prices[req.body.resource]);
            if (game.market.prices[req.body.resource] > game._doc.market.maxPrice)
                game.market.prices[req.body.resource] = game._doc.market.maxPrice;
            gameController.rotatePlayerOrder(game);
        }

        gameController.updatePlayerInfo(game);
        game.save();

        res.json({ player: player });
    }
    else { 
        console.log("incorrect action " + req.body.action + " " + game.playerOrder); 
        res.json("ERROR - incottect action or player");
    }
});

/**
 * req.body.game: game._id
 * req.body.player: player._id
 * req.body.attackingRegion: region._id  // of the region attacking from
 * req.body.defendingRegion: region._id  // of the region being attacked
 * req.body.units: Object  // units attacking with
 */
router.route("/attack").post(async (req, res) => {
    console.log("POST player/attack");
    
    let game = await Game.findOne({ _id: req.body.game });

    if (game.state != "act.attack") {
        res.json({ message: "ERROR - game.state is " + game.state });
        return;
    }

    if (game.playerOrder[0] != req.body.player) {
        res.json({ message: "ERROR - game.playerOrder is " + game.playerOrder });
        return;
    }

    let attackingRegion = game.regions.filter(region => region._id == req.body.attackingRegion)[0];
    let defendingRegion = game.regions.filter(region => region._id == req.body.defendingRegion)[0];

    let attacker = game.players.filter(player => player._id == req.body.player)[0];
    let defender = game.players.filter(player => player._id.equals(defendingRegion.player))[0];

    let units = req.body.units;

    // check if attacker owns the attackingRegion
    if (!attackingRegion.player.equals(attacker._id)) {
        res.json({ message: "ERROR - attacker does not control the region " + attackingRegion.player + " " + attacker._id });
        return;
    }

    // attacker cannot own the defendingRegion
    if (defendingRegion.player.equals(attacker._id)) {
        res.json({ message: "ERROR - attacker cannot attack own region" });
        return;
    }

    // cannot attack with radars
    if (units.radars > 0) {
        res.json({ message: "ERROR - cannot attack with radars" });
        return;
    }

    // cannot attack with both ground units and air units
    if ((units.land > 0 || units.naval > 0 || units.amphibious > 0) &&
        (units.atomBombs > 0 || units.bioweapons > 0)) {
        res.json({ message: "ERROR - cannot attack with land and air units" });
        return;
    }

    // check for atomBombs or bioweapons
    if (units.atomBombs > 0 || units.bioweapons > 0) {
        if (units.atomBombs > 0 && units.bioweapons > 0) {
            res.json({ message: "ERROR - cannot attack with both atomBombs and bioweapons" });
            return;
        }

        if (attackingRegion._doc.units.atomBombs < units.atomBombs) {
            res.json({ message: "ERROR - not enough atomBombs in region" });
            return;
        }
        if (attackingRegion._doc.units.bioweapons < units.bioweapons) {
            res.json({ message: "ERROR - not enough bioweapons in region" });
            return;
        }

        // get amount of units attacking with
        let attackCount = Math.max(units.atomBombs, units.bioweapons);

        // count radars
        let radarCount = defendingRegion.units.radars;
        for (adjacentRegionName of defendingRegion.adjacentRegionNames) {
            let adjacentDefendingRegion = game.regions.filter(region => region.name == adjacentRegionName)[0];
            radarCount += adjacentDefendingRegion.units.radars;
        }

        console.log("radarCount: " + radarCount);

        for (let i = 0; i < attackCount; i++) {
            // consume weapon
            console.log(units);
            if (units.atomBombs > 0) attackingRegion.units.atomBombs -= 1;
            if (units.bioweapons > 0) attackingRegion.units.bioweapons -= 1;

            // check if radar defends
            let radarChance = 1 / radarCount;
            let radarRoll = Math.random();
            let radarDefends = radarRoll > radarChance;

            console.log("radarDefends: " + radarDefends + " radarChance: " + radarChance + " radarRoll " + radarRoll);

            if (!radarDefends) {
                for (unit in defendingRegion.units) { 
                    defendingRegion.units[unit] = 0;
                }
                defendingRegion.industrialization.agriculture = 0;
                defendingRegion.industrialization.mining = 0;
                defendingRegion.industrialization.synthetics = 0;

                // used bioweapons
                if (units.bioweapons > 0) {
                    defendingRegion.traverseCountdown = 5;
                }

                break;
            }
        }

        gameController.updatePlayerInfo(game);
        game.save();

        console.log("special attack completed");
        res.json({
            attacker: attacker,
            defender: defender,
            attackingRegion: attackingRegion,
            defendingRegion: defendingRegion,
            game: game
        });
        return;

    }

    // attacker not using atomBombs or bioweapons
    else {
        // check if regions are adjacent
        if (!attackingRegion.adjacentRegionNames.includes(defendingRegion.name)) {
            res.json({ message: "ERROR - regions are not adjacent" });
            return;
        }

        // regions are adjacent
        else {
            // check if attacking region's unit count is accurate
            for (unit in units) {
                if (attackingRegion._doc.units[unit] < units[unit]) {
                    res.json({ message: "ERROR - attacker does not have enough unit: " + [unit] });
                    return;
                }
            }

            // check if defending region has any units
            if (defendingRegion.units.land == 0 &&
                defendingRegion.units.naval == 0 &&
                defendingRegion.units.amphibious == 0) {
                res.json({ message: "ERROR - defending region has no defending units" });
                return;
            }

            // check if attacker has resources to attack
            if (attacker.resources.agriculture < game.market.costs.attacking.resources.agriculture ||
                attacker.resources.mining < game.market.costs.attacking.resources.mining || 
                attacker.resources.synthetics < game.market.costs.attacking.resources.synthetics) {
                res.json({ message: "ERROR - player does not have enough resources to attack" });
                return;
            }

            // check if defender has resources to defend
            let defenderHasResources = true;
            console.log(defender);
            console.log(game.market.costs.defending.resources);
            for (resource in game._doc.market.costs.defending.resources) {
                if (defender.resources[resource] < game.market.costs.defending.resources[resource]) {
                    console.log("defender does not have enough resources to defend");
                    defenderHasResources = false;
                    break;
                }
            }

            // attack can happen beyond this point ************************
            // subtract resources from players
            for (resource in game.market.costs.attacking.resources) {
                attacker.resources[resource] -= game.market.costs.attacking.resources[resource];
            }
            if (defenderHasResources) {
                for (resource in game.market.costs.defending.resources) {
                    defender.resources[resource] -= game.market.costs.defending.resources[resource];
                }
            }

            // give dice to players
            let attackerDice = 1;
            let defenderDice = 1;
            if (defenderHasResources) defenderDice += 1;

            // give extra die to player with more units
            let attackingUnitCount = units.amphibious;
            let defendingUnitCount = defendingRegion._doc.units.amphibious;

            if (attackingRegion.type == "land" && defendingRegion.type == "land") {
                attackingUnitCount += units.land;
                defendingUnitCount += defendingRegion._doc.units.land;
            }
            else if (attackingRegion.type != "land" && defendingRegion.type != "land") {
                attackingUnitCount += units.naval;
                defendingUnitCount += defendingRegion._doc.units.naval;
            }

            if (attackingUnitCount > defendingUnitCount) {
                attackerDice += 1;
            }
            else {
                defenderDice += 1;
            }

            // roll dice to determine results
            let attackerSum = 0;
            let defenderSum = 0;
            
            for (let i = 0; i < attackerDice; i++) {
                attackerSum += 1 + Math.floor(Math.random() * 4);
            }
            for (let i = 0; i < defenderDice; i++) {
                defenderSum += 1 + Math.floor(Math.random() * 4);
            }

            console.log("attackerSum: " + attackerSum + ", defenderSum: " + defenderSum);
            let losingRegion = attackerSum <= defenderSum ? attackingRegion : defendingRegion;

            // remove 1 land / marine / amphibious unit from loser
            if (losingRegion.type == "land" && losingRegion.units.land > 0) {
                losingRegion.units.land -= 1;
            }
            else if (losingRegion.type != "land" && losingRegion.units.naval > 0) {
                losingRegion.units.naval -= 1;
                // kill ferried land units
                losingRegion.units.land = Math.min(losingRegion.units.land, losingRegion.units.naval * 3);
            }
            else {
                losingRegion.units.amphibious -= 1;
            }

            gameController.updatePlayerInfo(game);
            game.save();
        }
    }

    console.log("attack completed");
    res.json({
        attacker: attacker,
        defender: defender,
        attackingRegion: attackingRegion,
        defendingRegion: defendingRegion,
        game: game
    });
});

/**
 * req.body.game: game._id
 * req.body.player: player._id
 * req.body.originRegion: region._id
 * req.body.targetRegion: reqgion._id
 * req.body.units: {
 *      land: Number,
 *      naval: Number,
 *      amphibious: Number
 * }
 */
router.route("/move").post(async (req, res) => {
    console.log("POST player/move");

    let game = await Game.findOne({ _id: req.body.game });
    
    // check game.state
    if (game.state != "act.move") {
        res.json({ message: "game.state is " + game.state });
        return;
    }

    // check if player's turn
    if (game.playerOrder[0].equals == req.body.player) {
        res.json({ message: "game.playerOrder is " + game.playerOrder });
        return;
    }

    let player = game.players.filter(player => player._id == req.body.player)[0];

    let originRegion = game.regions.filter(region => region._id == req.body.originRegion)[0];
    let targetRegion = game.regions.filter(region => region._id == req.body.targetRegion)[0];

    let units = req.body.units;

    // check if player owns originRegion
    if (!originRegion.player.equals(player._id)) {
        res.json({message: "ERROR - player does not own region" });
        return;
    }

    // check if targetRegion is occupied
    if (typeof targetRegion.player == "undefined" || !targetRegion.player.equals(req.body.player)) {
        if (targetRegion.units.land > 0 || 
            targetRegion.units.naval > 0 || 
            targetRegion.units.amphibious > 0) {
            res.json({ message: "ERROR - targetRegion not owned by player " + targetRegion.player + " " + targetRegion.units });
            return;
        }
    }

    // check if targetRegion is traversable
    console.log("traverseCountdown: " + targetRegion.traverseCountdown);
    if (targetRegion.traverseCountdown > 0) {
        res.json({ message: "ERROR - region cannot be traversed for " + targetRegion.traverseCountdown + " turn(s)" });
        return;
    }

    // check if originRegion has enough units
    for (unit in originRegion.units) {
        if (originRegion.units[unit] < units[unit]) {
            res.json({ message: "ERROR - not enough unit " + unit });
            return;
        }
    }

    // check if unit types are correct
    if (targetRegion.type == "land" && units.naval > 0) {
        res.json({ message: "ERROR - naval units cannot be on land" });
        return;
    }

    // move units
    for (unit in units) {
        originRegion.units[unit] -= units[unit];
        targetRegion.units[unit] += units[unit];
    }

    // check if naval units can ferry land units
    if ((targetRegion.type != "land" && targetRegion.units.land > 3 * targetRegion.units.naval) ||
        (originRegion.type != "land" && originRegion.units.land > 3 * originRegion.units.naval)) {
        res.json({ message: "ERROR - not enough naval units to carry land units, land " + targetRegion.units + " " + originRegion.units });
        return;
    }

    // check if player has enough resources
    let totalUnits = 0;
    for (unit in units) { 
        totalUnits += units[unit]; 
    }
    // subtract ferrying cost
    if (targetRegion.type != "land" || originRegion.type != "land") {
        console.log("naval units ferrying or were ferrying " + targetRegion.units.land + " unit(s)");
        totalUnits -= units.land;
    }
    console.log("totalUnits: " + totalUnits);

    if (player.resources.agriculture < totalUnits * game.market.costs.moving.resources.agriculture ||
        player.resources.mining < totalUnits * game.market.costs.moving.resources.mining) {
        res.json({ message: "ERROR - player does not have enough resources" });
        return;
    };

    // remove resources from player
    player.resources.agriculture -= totalUnits * game.market.costs.moving.resources.agriculture;
    player.resources.mining -= game.market.costs.moving.resources.mining;

    targetRegion.player = player._id;  // give targetRegion to player

    console.log("move completed");

    gameController.updatePlayerInfo(game);
    game.save();

    res.json({
        targetRegion: targetRegion,
        originRegion: originRegion,
        game: game
    });
});

/**
 * req.body.game: game._id
 * req.body.player: player._id
 * req.body.units: Object  // unit type with number
 * req.body.region: region._id  // where the unit will be built
 */
router.route("/build").post(async (req, res) => {
    console.log("POST player/research");

    let game = await Game.findOne({ _id: req.body.game });

    let player = game.players.filter(player => player._id == req.body.player)[0];
    let region = game.regions.filter(region => region._id == req.body.region)[0];

    let units = req.body.units;

    if (game.state != "act.build") {
        res.json({ message: "game.state is " + game.state });
        return;
    }

    if (game.playerOrder[0] != req.body.player) {
        res.json({ message: "game.playerOrder is " + game.playerOrder });
        return;
    }

    // check if player owns the region
    if (typeof region.player == "undefined" || !region.player.equals(player._id)) {
        // if it's not land, check if it's owned by another player
        if (region.type != "land") {
            // check if nonland region is adjacent
            let playerRegions = game._doc.regions.filter(
                region => typeof region.player != "undefined" && region.player.equals(player._id));
            let regionIsAdjacent = false;
            for (playerRegion of playerRegions) {
                for (adjacentRegionName of playerRegion.adjacentRegionNames) {
                    if (region.name == adjacentRegionName) {
                        regionIsAdjacent = true;
                        break;
                    }
                }
            }

            if (!regionIsAdjacent) {
                res.json({ message: "ERROR - nonland region is not adjacent" });
                return;
            }

            // check if another player has units in this region
            for (unit in units) {
                if (region.units.land > 0 || region.units.naval > 0 || region.units.amphibious > 0) {
                    res.json({ 
                        message: "ERROR - another player has units in this region",
                        region: region
                    });
                    return;
                }
            }
        }
        // player cannot build on a land region
        else {
            res.json({ message: "ERROR - player does not own the region" });
            return;
        }
    }

    // check region type
    if (region.type == "land" && units.naval > 0) {
        res.json({ message: "ERROR - cannot build naval units on land " });
        return;
    }
    else if (region.type != "land" && 
        (units.land > 0 || units.atomBombs > 0 || units.bioweapons > 0)) {
        res.json({ message: "ERROR - cannot build units in " + region.type });
        return;
    }

    // calculate costs
    let cost = 0;
    let resourcesCost = {
        agriculture: 0,
        mining: 0,
        synthetics: 0
    };
    
    for (unit in units) {
        for (let i = 0; i < units[unit]; i++) {
            cost += game.market.costs[unit].price;
            for (resource in game._doc.market.costs[unit].resources) {
                resourcesCost[resource] += game._doc.market.costs[unit].resources[resource];
            }
        }
    }

    console.log(resourcesCost);

    // check if player has researched special units
    for (researchUnit in player.research) {
        if (units[researchUnit] && !player.research[researchUnit]) {
            res.json({ message: "ERROR - player has not researched unit: " + researchUnit });
            return;
        }
    }

    // check if player has enough balance and resources
    if (player.balance < cost) {
        res.json({ message: "ERROR - player does not have enough in balance: " + player.balance + ", cost: " + cost });
        return;
    }
    for (resource in resourcesCost) {
        if (player.resources[resource] < resourcesCost[resource]) {
            res.json({ 
                message: "ERROR - player does not have enough resources",
                resourcesCost: resourcesCost,
                player: player 
            });
            return;
        }
    }

    // subtract costs and build
    player.balance -= cost;
    for (resource in resourcesCost) {
        player.resources[resource] -= resourcesCost[resource];
    }

    for (unit in units) {
        region.units[unit] += units[unit];
    }

    // give region to player
    region.player = player._id;

    console.log("build complete");

    gameController.updatePlayerInfo(game);
    game.save();

    res.json({
        game: game
    });
});

/**
 * req.body.game: game._id
 * req.body.player: player._id
 * req.body.research: String  // "agriculture", "mining", "synthetics", "radars", "atomBombs", "bioweapons"
 * req.body.region: region._id  // where to insudtrialize
 */
router.route("/research").post(async (req, res) => {
    console.log("POST player/research");

    let game = await Game.findOne({ _id: req.body.game });
    let player = game.players.filter(player => player._id == req.body.player)[0];
    let region = game.regions.filter(region => region._id == req.body.region)[0];

    if (game.state != "act.build") {
        res.json({ message: "game.state is " + game.state });
        return;
    }

    if (game.playerOrder[0] != req.body.player) {
        res.json({ message: "game.playerOrder is " + game.playerOrder });
        return;
    }

    // industrialize a region
    if (["agriculture", "mining", "synthetics"].includes(req.body.research)) {
        // check if player has enough balance
        if (player.balance < game.market.costs.industrialization) {
            res.json({ message: "ERROR - player does not have high enough balance: " + player.balance });
            return;
        }

        // check if player owns the region
        if (typeof region.player == "undefined" || !region.player.equals(player._id)) {
            res.json({ message: "ERROR - player does not own the region" });
            return;
        }

        if (region.type != "land") {
            res.json({ message: "ERROR - cannot insturialze nonland region" });
            return;
        }

        // subtract balance and give chance to industrialize
        player.balance -= game.market.costs.industrialization;
        region.industrialization.investment += 1;
        if (Math.random() < 0.34) {
            console.log("industrialization for " + req.body.research + " success");
            region.industrialization[req.body.research] += 1;
        }
        else {
            console.log("industrialization for " + req.body.research + " failed");
        }
    }

    // research a special unit
    else {
        // check if player has already researched this unit
        if (player.research[req.body.research]) {
            res.json({ message: "ERROR - player has already researched " + req.body.research });
            return;
        }

        // check if player has enough balance
        if (player.balance < game.market.costs.research) {
            res.json({ message: "ERROR - player does not have high enough balance: " + player.balance });
            return;
        }

        player.balance -= game.market.costs.research;
        if (Math.random() < 0.34) {
            console.log("research for " + req.body.research + " success");
            player.research[req.body.research] = true;
        }
        else {
            console.log("research for " + req.body.research + " failed");
        }
    }

    console.log("research complete");

    gameController.updatePlayerInfo(game);
    game.save();

    res.json({
        game: game
    });
});

module.exports = router;