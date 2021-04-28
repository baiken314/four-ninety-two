const socket = io();

//const URL = "http://23.130.192.72:8000";
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
        leftoverX: null
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
        }
    }
});

// update the page onload
updateGameApp();