const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
    // back reference to Game
    game: {
        type: mongoose.Schema.ObjectId,
        ref: "Game"
    },

    // back reference to User
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User"
    },
    name: { type: String, default: "" },

    status: { type: String, default: "alive" },
    balance: { type: Number, default: 250 },
    
    focus: {
        sell: { type: Number, default: 0 },
        act: { type: Number, default: 0 },
        buy: { type: Number, default: 0 }
    },

    resources: {
        agriculture: { type: Number, default: 0 },
        mining: { type: Number, default: 0 },
        synthetics: { type: Number, default: 0 }
    },

    unitFees: { type: Number, default: 0 },
    incomingResources: {
        agriculture: { type: Number, default: 0 },
        mining: { type: Number, default: 0 },
        synthetics: { type: Number, default: 0 }
    },

    units: {
        land: { type: Number, default: 0 },
        naval: { type: Number, default: 0 },
        amphibious: { type: Number, default: 0 },
        atomBombs: { type: Number, default: 0 },
        bioweapons: { type: Number, default: 0 },
        radars: { type: Number, default: 0 }
    },

    research: {
        atomBombs: { type: Boolean, default: false },
        bioweapons: { type: Boolean, default: false },
        radars: { type: Boolean, default: false }
    }
});

let Player = mongoose.model("Player", playerSchema);

module.exports.playerSchema = playerSchema;
module.exports.Player = Player;