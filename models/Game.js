const mongoose = require("mongoose");

const regionSchema = require("./Region").regionSchema;
const playerSchema = require("./Player").playerSchema;

const gameSchema = new mongoose.Schema({
    // who is playing the game
    players: [playerSchema],
    playerOrder: [String],  // player._ids

    // only to be used for as a reference
    map: {
        type: mongoose.Schema.ObjectId,
        ref: "Map"
    },

    // new Regions shall be created based off the map.regions references
    // these will hold the stats of each Region during gameplay
    regions: [regionSchema],

    turn: { type: Number, default: 1 },  // number of turns completed
    state: { type: String, default: "initialization" },  // control what part of each turn Game is in

    market: {
        priceIncrement: { type: Number, default: 1 },
        minPrice: { type: Number, default: 1 },
        maxPrice: { type: Number, default: 50 },
        maxResources: { type: Number, default: 100 },
        prices: {
            agriculture: { type: Number, default: 20 },
            mining: { type: Number, default: 20 },
            synthetics: { type: Number, default: 20 }
        },
        costs: {
            research: { type: Number, default: 10 },
            industrialization: { type: Number, default: 10 },
            unitFee: { type: Number, default: 1 },
            moving: {
                resources: {
                    agriculture: { type: Number, default: 1 },
                    mining: { type: Number, default: 1 },
                    synthetics: { type: Number, default: 0 }
                }
            },
            attacking: {
                resources: {
                    agriculture: { type: Number, default: 3 },
                    mining: { type: Number, default: 3 },
                    synthetics: { type: Number, default: 3 }
                }
            },
            defending: {
                resources: {
                    agriculture: { type: Number, default: 1 },
                    mining: { type: Number, default: 1 },
                    synthetics: { type: Number, default: 1 }
                }
            },
            land: {
                price: { type: Number, default: 5 },
                resources:  {
                    agriculture: { type: Number, default: 1 },
                    mining: { type: Number, default: 1 },
                    synthetics: { type: Number, default: 1 }
                }
            },
            naval: {
                price: { type: Number, default: 5 },
                resources: {
                    agriculture: { type: Number, default: 1 },
                    mining: { type: Number, default: 1 },
                    synthetics: { type: Number, default: 1 }
                }
            },
            amphibious: {
                price: { type: Number, default: 5 },
                resources: {
                    agriculture: { type: Number, default: 2 },
                    mining: { type: Number, default: 2 },
                    synthetics: { type: Number, default: 2 }
                }
            },
            atomBombs: {
                price: { type: Number, default: 25 },
                resources: {
                    agriculture: { type: Number, default: 0 },
                    mining: { type: Number, default: 0 },
                    synthetics: { type: Number, default: 5 }
                }
            },
            bioweapons: {
                price: { type: Number, default: 30 },
                resources: {
                    agriculture: { type: Number, default: 0 },
                    mining: { type: Number, default: 0 },
                    synthetics: { type: Number, default: 5 }
                }
            },
            radars: {
                price: { type: Number, default: 15 },
                resources: {
                    agriculture: { type: Number, default: 0 },
                    mining: { type: Number, default: 0 },
                    synthetics: { type: Number, default: 3 }
                }
            },
            special: {
                price: { type: Number, default: 25 },
                resources: {
                    agriculture: { type: Number, default: 0 },
                    mining: { type: Number, default: 0 },
                    synthetics: { type: Number, default: 5 }
                }
            }
        }
    },

});

let Game = mongoose.model("Game", gameSchema);

module.exports = Game;