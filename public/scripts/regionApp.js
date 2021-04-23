const socket2 = io();

//const URL2 = "https://23.130.192.72:8000";
const URL2 = "http://localhost:8000";

// grab game information from the player-session and load into regionApp
async function updateRegionApp() {
    console.log("updateRegionApp in regionApp.js");

    const playerSessionRequest = await fetch(URL2 + "/player-session");
    const playerSession = await playerSessionRequest.json();

    regionApp.player = playerSession.player;
    regionApp.game = playerSession.game;
}

socket2.on("updateGameApp", updateRegionApp);

let regionApp = new Vue({
    el: "#region-app",
    data:
    {
        selectedRegion: null,
        player: {},
        game: null,
        targetRegion: null,
        showActions: true
    },
    methods:
    {
        attack: async function()
        {
            const playerAttackRequest = await fetch(URL2 + "/player/attack", {
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
                        land: document.getElementById("landAttackCount"),
                        naval: document.getElementById("navalAttackCount"),
                        amphibious: document.getElementById("amphibiousAttackCount"),
                        atomBombs: document.getElementById("atomBombsAttackCount"),
                        bioweapons: document.getElementById("bioweaponsAttackCount"),
                        radars: 0
                    }
                })
            });
            const playerAttack = await playerAttackRequest.json();
            console.log(playerAttack);
        },
        move: async function()
        {
            const playerMoveRequest = await fetch(URL2 + "/player/move", {
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
                            land: document.getElementById("landMoveCount"),
                            naval: document.getElementById("navalMoveCount"),
                            amphibious: document.getElementById("amphibiousMoveCount")
                        }
                  })
            });
            const playerMove = await playerMoveRequest.json();
            console.log(playerMove);
        }
    }
});

// update the page onload
updateRegionApp();