const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
const httpServer = require("http").Server(app);
const io = require("socket.io")(httpServer);

module.exports.io = io;

const MongoStore = require("connect-mongo")(session);

const gameRouter = require("./routes/gameRouter");
const mapRouter = require("./routes/mapRouter");
const playerRouter = require("./routes/playerRouter");
const userRouter = require("./routes/userRouter");

const User = require("./models/User");
const Game = require("./models/Game");

const MONGO_URI = "mongodb+srv://highlandcentralinc:joenamath2021@cluster0.nz8tm.mongodb.net/senior_project?retryWrites=true&w=majority";
const PORT = 8000;

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));

app.use(session({
    secret: "secret",
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
        url: MONGO_URI
    })
}));

app.use("/game", gameRouter);
app.use("/map", mapRouter);
app.use("/player", playerRouter);
app.use("/user", userRouter);

app.get("/", (req, res) => {
    console.log("GET /");
    req.session.gameId = null;
    res.redirect("/userpage");
});

app.get("/index", async (req, res) => {
    console.log("GET /index");
    console.log("index gameId: " + req.session.gameId);
    if (req.session.gameId == null) {
        res.redirect("/userpage");
        return;
    }
    res.sendFile(__dirname + "/views/index.html");
});

app.get("/index/:id", async (req, res) => {
    console.log("GET /index/:id");
    req.session.game = await Game.findOne({ _id: req.params.id });
    req.session.gameId = req.session.game._id;
    console.log("index/id gameId: " + req.session.gameId);
    req.session.save(() => {
        res.redirect("/index");
    });
});

app.get("/login", async (req, res) => {
    console.log("GET /login");
    req.session.gameId = null;
    req.session.save(() => {
        if (req.session.user == null) {
            res.sendFile(__dirname + "/views/login.html");
            return;
        }
        else {
            res.sendFile(__dirname + "/views/userpage.html");
        }
    });
});

/**
 * req.body.name: String
 * req.body.email: String
 * req.body.password: String
 */
app.post("/login", async (req, res) => {
    console.log("POST /login");
    // login
    const user = await User.findOne({ name: req.body.name });
    if (user || !req.body.email) {
        if (!user) {
            res.json({ message: "ERROR - user does not exist"});
        }
        else if (req.body.password != user.password) {
            res.json({ message: "ERROR - password does not match"});
        }
        else {
            req.session.user = user;
            req.session.save(() => {
                res.redirect("/userpage");
            });
        }
    }
    // create new account and login
    else {
        try {
            const newUser = await User.create({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password
            });
            req.session.user = newUser;
            req.session.save(() => {
                res.redirect("/userpage");
            });
        }
        catch (e) {
            res.json({ message: "ERROR"} );
        }
    }
});

app.get("/logout", async (req, res) => {
    console.log("GET /logout");
    req.session.user = null;
    req.session.save(() => {
        res.redirect("/login");
    });
});

app.get("/userpage", async (req, res) => {
    console.log("GET /userpage");
    if (req.session.user != null) {
        res.sendFile(__dirname + "/views/userpage.html");
        return;
    }
    res.redirect("/login");
});

app.get("/user-session", async (req, res) => {
    console.log("GET /user-session");

    let user = await User.findOne({ _id: req.session.user._id });

    // remove players from deleted games
    let players = [];
    for (player of user.players) {
        let game = await Game.findOne({ _id: player.game });
        if (game != null) {
            players.push(player);
        }
    }

    user.players = players;
    user.save();
    
    req.session.user = user;

    // clear current game
    req.session.gameId = null;
    req.session.game = null;

    req.session.save(() => {
        res.json(req.session);
    });
});

app.get("/player-session", async (req, res) => {
    console.log("GET /player-session");

    if (req.session.gameId == null) {
        res.json({ message: "ERROR - user does not have a gameId" });
        return;
    }

    req.session.game = await Game.findOne({ _id: req.session.gameId }).populate({ path: "players.user.name" });
    req.session.player = req.session.game.players.filter(player => player.user.equals(req.session.user._id))[0];

    req.session.save(() => {
        res.json(req.session);
    });
});

const listener = httpServer.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
});