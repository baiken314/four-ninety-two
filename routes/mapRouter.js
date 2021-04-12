const Map = require("../models/Map");

const router = require("express").Router();

router.route("/").get(async (req, res) => {
    console.log("GET map");
    res.json(await Map.find());
});

router.route("/find/:id").get(async (req, res) => {
    console.log("GET map/:id");
    res.json(await Map.findOne({ _id: req.params.id }));
});

module.exports = router;