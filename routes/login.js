const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/userSchema");
const Refresh_Token = require("../models/refreshTokenSchema");
const jwt = require("jsonwebtoken");

router.post("/", async (req, res) => {
    //getting the email to identify the user and password login request
    const email = req.body.email;
    const plaintextpassword = req.body.password;
    console.log("Email attempting to login:", email);

    //finding the user using the passed email
    const user = await User.findOne({ email: email });

    //if the email isn't in our database we return an error
    if (!user) return res.status(400).send({ message: "User not exist" });

    //password check
    bcrypt.compare(plaintextpassword, user.saltedHashedPass, async (err, data) => {
        //if error than throw error
        if (err) res.status(500).send({ message: err.message });

        //if both match than you can do anything
        if (data) {
            const accessToken = jwt.sign({ userId: user._id.toString() }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });

            // Refresh token
            let refreshToken = await Refresh_Token.findById(user._id);
            if (!refreshToken) {
                refreshToken = jwt.sign({ userId: user._id.toString() }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "30d" });
                await new Refresh_Token({ _id: user._id, token: refreshToken }).save();
                console.log("Created new Refresh_Token for userId:", user._id);
            } else {
                refreshToken = refreshToken.token;
            }
            console.log("Login successful");
            res.status(200).send({ accessToken: accessToken, refreshToken: refreshToken, message: "Login Successful!" });
        }
        //if it fails the password is incorrect
        else {
            console.log(`${email} failed to login`);
            res.status(401).send({ message: "Invalid credentials!" });
        }
    });
});

module.exports = router;
