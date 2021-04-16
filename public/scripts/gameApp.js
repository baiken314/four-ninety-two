const socket = io();

//const URL = "https://23.130.192.72:8000";
const URL = "http://localhost:8000";

// grab game information from the player-session and load into gameApp
async function updateGameApp() {
    console.log("updateGameApp in gameApp.js");

    const playerSessionRequest = await fetch(URL + "/player-session");
    const playerSession = await playerSessionRequest.json();

    gameApp.user = playerSession.user;
    gameApp.game = playerSession.game;
    gameApp.player = playerSession.player;
    gameApp.windowResize();

    console.log(JSON.stringify(playerSession.player));
    console.log(JSON.stringify(playerSession.game.state));
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
        //canvas: null,
        //ctx: null,
        agricultureMarketRequest: null,
        miningMarketRequest: null,
        syntheticsMarketRequest: null,
        leftoverX: null,
        currentlySelectedRegion: null
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
            const playerMarketOrder = await playerMarketOrderRequest.json();
            console.log(playerMarketOrder);
        },

        updateRegionBar: function()
        {
            document.getElementById('regionBar').className = document.getElementById('regionBar').className.replace(" w3-hide", " w3-show");
            document.getElementById('actButtons').className = document.getElementById('actButtons').className.replace(" w3-show", " w3-hide");
            document.getElementById('regionBarInfoLeftHeader').innerHTML =  "-=- " + this.currentlySelectedRegion.name;
            if (this.currentlySelectedRegion.player != null)
            {
                document.getElementById('regionBarInfoLeftHeader').innerHTML += " - " + gameApp.game.players.filter(player => player._id == this.currentlySelectedRegion.player)[0].name;
                if (this.currentlySelectedRegion.player == this.player._id)
                {
                    document.getElementById('actButtons').className = document.getElementById('actButtons').className.replace(" w3-hide", " w3-show");
                }
            }
            document.getElementById('regionBarInfoLeftHeader').innerHTML += " -=-";
            document.getElementById('regionBarInfoLeftBody').innerHTML = "Agriculture: " + this.currentlySelectedRegion.industrialization.agriculture + " | Mining: " + this.currentlySelectedRegion.industrialization.mining + " | Synthetics: " + this.currentlySelectedRegion.industrialization.synthetics;
            document.getElementById('regionBarInfoLeftBody').innerHTML += "<br>Land: " + this.currentlySelectedRegion.units.land + " | Naval: " + this.currentlySelectedRegion.units.naval + " | Amphibious: " + this.currentlySelectedRegion.units.amphibious;
            document.getElementById('regionBarInfoLeftBody').innerHTML += "<br>Atom Bombs: " + this.currentlySelectedRegion.units.atomBombs + " | Bioweapons: " + this.currentlySelectedRegion.units.bioweapons + " | Radars: " + this.currentlySelectedRegion.units.radars;
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
                    game: this.game._id,
                    attackingRegion: this.currentlySelectedRegion,
                    defendingRegion: "",
                    player: this.player._id,
                    units:
                    {
                        land: this.currentlySelectedRegion.units.land,
                        naval: this.currentlySelectedRegion.units.naval,
                        amphibious: this.currentlySelectedRegion.units.amphibious,
                        atomBombs: this.currentlySelectedRegion.units.atomBombs,
                        bioweapons: this.currentlySelectedRegion.units.bioweapons,
                        radars: this.currentlySelectedRegion.units.radars
                    }
                })
            });
            const playerAttack = await playerAttackRequest.json();
            console.log(playerAttack);
        }
    }
});

// update the page onload
updateGameApp();