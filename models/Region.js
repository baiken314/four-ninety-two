const mongoose = require("mongoose");

const regionSchema = new mongoose.Schema({
    name: String,
    type: String,  // "land", "sea", "ocean"

    adjacentRegionNames: [String],

    /**********************************
     * fields populated during gameplay
    ***********************************/
    traverseCountdown: { type: Number, default: 0 },  // 0: traversable, -1: atom bombed

    // Regions accessible by this Region
    adjacentRegions: [{
        type: mongoose.Schema.ObjectId,
        ref: "Region"
    }],

    // who controls the troops in the Region
    player: {
        type: mongoose.Schema.ObjectId,
        ref: "Player"
    },

    units: {
        land: { type: Number, default: 0 },
        naval: { type: Number, default: 0 },
        amphibious: { type: Number, default: 0 },
        atomBombs: { type: Number, default: 0 },
        bioweapons: { type: Number, default: 0 },
        radars: { type: Number, default: 0 }
    },

    industrialization: {
        investment: { type: Number, default: 0 },
        active: { type: Boolean, default: true },
        agriculture: { type: Number, default: 0 },
        mining: { type: Number, default: 0 },
        synthetics: { type: Number, default: 0 }
    }
});

let Region = mongoose.model("Region", regionSchema);

module.exports = {
    Region: Region,
    regionSchema: regionSchema
};