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

socket2.on("updateRegionApp", updateRegionApp);

let regionApp = new Vue({
    el: "#region-app",
    data:
    {
        selectedRegion: null,
        player: {},
        game: null
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
                    attackingRegion: this.selectedRegion,
                    defendingRegion: "",
                    player: this.player._id,
                    units:
                    {
                        land: this.selectedRegion.units.land,
                        naval: this.selectedRegion.units.naval,
                        amphibious: this.selectedRegion.units.amphibious,
                        atomBombs: this.selectedRegion.units.atomBombs,
                        bioweapons: this.selectedRegion.units.bioweapons,
                        radars: 0
                    }
                })
            });
            const playerAttack = await playerAttackRequest.json();
            console.log(playerAttack);
        }
    }
});

// update the page onload
updateRegionApp();