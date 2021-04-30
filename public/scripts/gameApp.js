const socket = io();

//const URL = "http://23.130.192.72:8000";
const URL = "http://localhost:8000";

// grab game information from the player-session and load into gameApp
async function updateGameApp() {
    console.log("updateGameApp in gameApp.js");

    console.log("before playerSession fetch");
    const playerSessionRequest = await fetch(URL + "/player-session");
    const playerSession = await playerSessionRequest.json();
    console.log("after playerSession fetch");

    gameApp.user = playerSession.user;
    gameApp.game = playerSession.game;
    gameApp.player = playerSession.player;
    gameApp.windowResize();
}

socket.on("updateGameApp", updateGameApp);

// captures all data from player-session
let gameApp = new Vue({
    el: "#game-app",
    data: {
        user: {},
        game: null,
        player: {},
        currentlyOpened: null,

        agricultureMarketRequest: null,
        miningMarketRequest: null,
        syntheticsMarketRequest: null,
        leftoverX: null,

        selectedRegion: null,
        targetRegion: null,
        showActions: true,
        buildType: '',
        
        landAttackCount: null,
        navalAttackCount: null,
        amphibiousAttackCount: null,
        atomBombsAttackCount: null,
        bioweaponsAttackCount: null,

        landMoveCount: null,
        navalMoveCount: null,
        amphibiousMoveCount: null,

        landBuildCount: null,
        navalBuildCount: null,
        amphibiousBuildCount: null,
        atomBombsBuildCount: null,
        bioweaponsBuildCount: null,
        radarsBuildCount: null,

        adjacentRegionIsOwnedByPlayer: false
    },
    created()
    {
        window.addEventListener("resize", this.windowResize);
    },
      destroyed()
    {
        window.removeEventListener("resize", this.windowResize);
    },
    methods:
    {
        windowResize: function()
        {
            if(document.getElementById('leftColumn') != null && document.getElementById('rightColumn') != null)
            {
                var leftColumnPosition = document.getElementById('leftColumn').getBoundingClientRect();
                var leftX = leftColumnPosition.right;
                var rightColumnPosition = document.getElementById('rightColumn').getBoundingClientRect();
                var rightX = rightColumnPosition.left;
                this.leftoverX = rightX - leftX;
                //console.log(leftoverX);
            }
        },
        openAccordian: function(x)
        {
            x = document.getElementById(x);
            if (this.currentlyOpened != x)
            {
                if (this.currentlyOpened != null)
                {
                    this.currentlyOpened.className = this.currentlyOpened.className.replace(" w3-show", "");
                }
                x.className += " w3-show";
                this.currentlyOpened = x;
            }
        },

        closeAccordian: function(x)
        {
            x = document.getElementById(x);
            this.currentlyOpened.className = this.currentlyOpened.className.replace(" w3-show", "");
            this.currentlyOpened = null;
        },

        submitFocuses: async function()
        {
            //send focuses to server here with api call
            const playerFocusRequest = await fetch(URL + "/player/focus", {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    game: this.game._id,
                    player: this.player._id,
                    focusValues: [
                        document.getElementById("sellFocus").value,
                        document.getElementById("actFocus").value,
                        document.getElementById("buyFocus").value
                    ]
                })
            });
            const playerFocus = await playerFocusRequest.json();
            console.log(playerFocus);
        },

        endTurn: async function()
        {
            const playerEndTurnRequest = await fetch(URL + "/player/end-turn", {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    game: this.game._id,
                    player: this.player._id
                })
            });
            const playerEndTurn = await playerEndTurnRequest.json();
            console.log(playerEndTurn);
        },

        submitMarketOrder: async function(passedAction, passedResource)
        {
            var passedAmount = null;
            if (passedResource == 'agriculture')
            {
                passedAmount = this.agricultureMarketRequest;
            }
            else if (passedResource == 'mining')
            {
                passedAmount = this.miningMarketRequest;
            }
            else if (passedResource == 'synthetics')
            {
                passedAmount = this.syntheticsMarketRequest;
            }

            const playerMarketOrderRequest = await fetch(URL + "/player/market-order", {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    game: this.game._id,
                    player: this.player._id,
                    resource: passedResource,
                    action: passedAction,
                    amount: passedAmount
                })
            });

            this.agricultureMarketRequest = null;
            this.miningMarketRequest = null;
            this.syntheticsMarketRequest = null;

            const playerMarketOrder = await playerMarketOrderRequest.json();
            console.log(playerMarketOrder);
        },
        attack: async function()
        {
            const playerAttackRequest = await fetch(URL + "/player/attack", {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    game: gameApp.game._id,
                    attackingRegion: this.selectedRegion._id,
                    defendingRegion: this.targetRegion._id,
                    player: this.player._id,
                    units:
                    {
                        land: Number(this.landAttackCount),
                        naval: Number(this.navalAttackCount),
                        amphibious: Number(this.amphibiousAttackCount),
                        atomBombs: Number(this.atomBombsAttackCount),
                        bioweapons: Number(this.bioweaponsAttackCount),
                        radars: 0
                    }
                })
            });
            const playerAttack = await playerAttackRequest.json();
            this.targetRegion = null;
            this.selectedRegion = null;
            this.showActions = true;

            this.landAttackCount = null;
            this.navalAttackCount = null;
            this.amphibiousAttackCount = null;
            this.atomBombsAttackCount = null;
            this.bioweaponsAttackCount = null;

            console.log(playerAttack);
        },
        move: async function()
        {
            const playerMoveRequest = await fetch(URL + "/player/move", {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(
                    {
                        game: gameApp.game._id,
                        player: this.player._id,
                        originRegion: this.selectedRegion._id,
                        targetRegion: this.targetRegion._id,
                        units:
                        {
                            land: Number(this.landMoveCount),
                            naval: Number(this.navalMoveCount),
                            amphibious: Number(this.amphibiousMoveCount)
                        }
                  })
            });
            const playerMove = await playerMoveRequest.json();
            this.targetRegion = null;
            this.selectedRegion = null;
            this.showActions = true;

            this.landMoveCount = null;
            this.navalMoveCount = null;
            this.amphibiousMoveCount = null;

            console.log(playerMove);
        },
        build: async function()
        {
            const playerBuildRequest = await fetch(URL + "/player/build", {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(
                {
                        game: gameApp.game._id,
                        player: this.player._id,
                        region: this.selectedRegion._id,
                        units:
                        {
                            land: Number(this.landBuildCount),
                            naval: Number(this.navalBuildCount),
                            amphibious: Number(this.amphibiousBuildCount),
                            atomBombs: Number(this.atomBombsBuildCount),
                            bioweapons: Number(this.bioweaponsBuildCount),
                            radars: Number(this.radarsBuildCount)
                        }
                })
            });
            const playerBuild = await playerBuildRequest.json();
            this.showActions = true;

            this.landBuildCount = null;
            this.navalBuildCount = null;
            this.amphibiousBuildCount = null;
            this.atomBombsBuildCount = null;
            this.bioweaponsBuildCount = null;
            this.radarsBuildCount = null;

            console.log(playerBuild);
        },
        research: async function(type)
        {
            this.type = type;
            const playerResearchRequest = await fetch(URL + "/player/research", {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(
                {
                    game: gameApp.game._id,
                    player: this.player._id,
                    region: this.selectedRegion._id,
                    research: this.type
                })
            });
            const playerResearch = await playerResearchRequest.json();
            this.showActions = true;
            console.log(playerResearch);
        },
        checkIfAdjacentRegionIsOwnedByPlayer: function()
        {
            if (this.selectedRegion.type != "land" && gameApp.game.state == 'act.build')
            {
                for (adjacentRegion of this.selectedRegion.adjacentRegionNames)
                {
                    if (gameApp.game.regions.filter(region => region.name == adjacentRegion)[0].player != null && gameApp.game.regions.filter(region => region.name == adjacentRegion)[0].player == this.player._id)
                    {
                        this.adjacentRegionIsOwnedByPlayer = true;
                    }
                }
            }
        },
        actionClick: function(buttonName)
        {
            this.buttonName = buttonName;

            if (this.buttonName == 'attack')
            {
                if (gameApp.game.state == 'act.attack')
                {
                    this.targetRegion = 'waiting';
                    this.showActions = false;
                }
            }
            if (this.buttonName == 'move')
            {
                if (gameApp.game.state == 'act.move')
                {
                    this.targetRegion = 'waiting';
                    this.showActions = false;
                }
            }
            if (this.buttonName == 'recruit')
            {
                if (gameApp.game.state == 'act.build')
                {
                    this.buildType = 'recruit';
                    this.showActions = false;
                }
            }
            if (this.buttonName == 'develop')
            {
                if ((gameApp.game.state == 'act.build') && (this.selectedRegion.type == 'land'))
                {
                    this.buildType = 'develop';
                    this.showActions = false;
                }
            }
        }
    }
});

// update the page onload
updateGameApp();