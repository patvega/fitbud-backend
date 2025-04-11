const express = require("express");
const router = express.Router();
const User = require("../models/userSchema");
const Refresh_Token = require("../models/refreshTokenSchema");

router.post("/", async (req, res) => {
    console.log("Rolling back...");
    try {
        // delete the user from accounts AND delete the refresh_token too
        await User.findByIdAndDelete(req.body.userId);
        console.log("User deleted");
        await Refresh_Token.findByIdAndDelete(req.body.userId);
        console.log("Refresh token deleted");
        console.log("Roll back successful");
        return res.send({ message: "Account deleted successfully!" });
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({ message: err.message });
    }
});

module.exports = router;
