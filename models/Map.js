/**
 * This collection is only to be used as a reference 
 * and not to be modified during gameplay.
 */

const mongoose = require("mongoose");

const mapSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true
    },
    description: String,

    // used to create Regions in a Game
    regions: [{
        name: String,
        type: { type: String },
        adjacentRegionNames: [String],
        coordinates: [{
            x: Number,
            y: Number
        }]
    }],

    // Region names where a Player can choose to start
    startingRegions: [{
        name: String,
        regionNames: [String]
    }]
});

let Map = mongoose.model("Map", mapSchema);

module.exports = Map;