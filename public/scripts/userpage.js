//const URL = "http://23.130.192.72:8000";
const URL = "http://" + window.location.host;

console.log("Starting.....");

async function getMap() {
    const mapsRequest = await fetch(URL + "/map");
    const maps = await mapsRequest.json();

    console.log("Getting maps");
    console.log(maps);

    userpageApp.maps = maps;
}

getMap();

async function getUserSession() {
    console.log("Getting user session");

    const userSessionRequest = await fetch(URL + "/user-session");
    const userSession = await userSessionRequest.json();

    console.log("userSession: " + JSON.stringify(userSession.user));

    // update userpageApp data
    userpageApp.user = userSession.user;

    // get open games
    let players = userSession.user.players.filter(game => game.status != "completed");
    let openGames = [];
    for (player of players)
    {
        openGames.push(player.game);
    }
    console.log(openGames);

    userpageApp.openGames = openGames;
}

// open games list app
let userpageApp = new Vue({
    el: "#userpage-app",
    data: {
        user: {},
        openGames: [],
        maps: []
    }
});

// create game button
let createGameButton = document.getElementById("create-game");
createGameButton.addEventListener("click", async function() {
    let map = document.getElementsByName("map")[0].value;
    let users = document.getElementsByName("users")[0].value.split(" ");
    console.log(map);
    console.log(users);

    const createGameRequest = await fetch(URL + "/game/create", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            map: map,
            users: users
        })
    });
    const createGameResponse = await createGameRequest.json();

    console.log(createGameResponse);

    getUserSession();
});

// logout button
let logoutButton = document.getElementById("logout");
logoutButton.addEventListener("click", function() {
    console.log("logging out...");
    window.location.href = `${URL}/logout`;
});

// learn button
let learnButton = document.getElementById("learn");
learnButton.addEventListener("click", function() {
    window.location.href = `${URL}/learn`;
});

getUserSession();  // populate user information