const express = require("express");
const router = express.Router();
const User = require("../models/userSchema");
const Refresh_Token = require("../models/refreshTokenSchema");
const jwt = require("jsonwebtoken");

router.delete("/", async (req, res) => {
    // getting the token from the Authorization: Bearer <token> header and verifying it
    let token;
    try {
        token = req.get("Authorization").split(" ")[1];
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            return res.status(401).send({ message: "Authentication failed. Access token expired." });
        }
        // did not provide token
        return res.status(401).send({ message: "Authentication failed. Bad credentials." });
    }

    try {
        let userId = jwt.decode(token).userId;
        // delete the user from accounts AND delete the refresh_token too
        await User.findByIdAndDelete(userId);
        await Refresh_Token.findByIdAndDelete(userId);
        return res.send({ message: "Account deleted successfully!" });
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({ message: "Internal Server Error! We are definitely, 100%, totally working on fixing this right now!" });
    }
});

module.exports = router;
