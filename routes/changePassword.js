const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/userSchema");

router.put("/", async (req, res) => {
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

    //collect password body
    const currPassword = req.body.currPassword;
    const newPassword = req.body.newPassword;
    const confirmNewPassword = req.body.confirmNewPassword;
    const email = req.body.email;

    //regex pasword criteria
    const passcheck = new RegExp(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!.@#\$%&\*\.])[A-Za-z0-9!.@#\$%&\*\.]{8,}$/);

    //if any of the fields are empty
    if (!currPassword || !newPassword || !confirmNewPassword) {
        return res.status(400).send({ message: "Missing fields!" });
    }

    //if the password does not match the confirm password
    if (newPassword != confirmNewPassword) {
        return res.status(400).send({ message: "Password fields do not match!" });
    }

    if (!passcheck.test(newPassword)) {
        console.log(passcheck.test(newPassword));
        return res.status(400).send({
            message:
                "Password must be at least 8 characters long, contain one uppercase letter, one lowercase letter, one number and one special character!",
        });
    }

    // plaintext password passes checks, time to hash new password and store it
    // now check if the current password is correct and change the password
    // can get user by userId now directly since we are using tokens :)
    const userAccount = await User.findById(jwt.decode(token).userId);

    bcrypt.compare(currPassword, userAccount.saltedHashedPass, (err, isMatch) => {
        if (err) {
            return res.status(500).send({ message: "Internal Server Error! We are definitely, 100%, totally working on fixing this right now!" });
        }

        if (!isMatch) {
            return res.status(400).send({ message: "Current password is incorrect." });
        }

        if (isMatch) {
            bcrypt.hash(newPassword, 12, (err, hash) => {
                if (err) {
                    return res.status(500).send({ message: err.message });
                }
                userAccount.saltedHashedPass = hash;
                userAccount.save();
                console.log("Password changed successfully");
                return res.status(201).send({ message: "No Content" });
            });
        }
    });
});

module.exports = router;
