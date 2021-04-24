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
        showActions: true,
        
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
        radarsBuildCount: null
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
            console.log(playerMove);
        },
        build: async function()
        {
            const playerBuildRequest = await fetch(URL2 + "/player/build", {
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
            console.log(playerBuild);
        }
    }
});

// update the page onload
updateRegionApp();