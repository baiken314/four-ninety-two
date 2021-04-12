const User = require("../models/User");

const router = require("express").Router();

router.route("/").get(async (req, res) => {
    console.log("GET user");
    res.json(await User.find());
});

/**
 * req.body.name: String
 * req.body.email: String
 * req.body.password: String
 */
router.route("/create").post(async (req, res) => {
    console.log("POST user/create");
    await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    });
    res.send("end POST user/create");
});

/**
 * req.body.name: String 
 * req.body.friendName: String
 */
router.route("/add-friend").post(async (req, res) => {
    console.log("POST user/add-friend");
    let user = await User.findOne({ name: req.body.name });
    let friend = await User.findOne({ name: req.body.friendName });
    user.friends.push(friend._id);
    friend.friends.push(user._id);
    user.save();
    friend.save();
    res.send("end POST user/add-friend");
});

module.exports = router;