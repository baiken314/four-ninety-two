const mongoose = require("mongoose");

const playerSchema = require("./Player").playerSchema;

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true
    },
    email: {
        type: String,
        unique: true
    },
    password: String,

    // keep track of what Games the User is in
    players: [playerSchema],

    friends: [{
        type: mongoose.Schema.ObjectId,
        ref: "User"
    }],

    stats: {
        wins: Number,
        losses: Number
    }
});

let User = mongoose.model("User", userSchema);

module.exports = User;