const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

router.post("/", (req, res) => {
    // getting the token from the Authorization: Bearer <token> header and verifying it
    console.log("/auth was called");
    let token;
    try {
        token = req.get("Authorization").split(" ")[1];
        console.log(token)
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        res.status(200).send({ message: "Authentication successful!" });
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            return res.status(401).send({ message: "Authentication failed. Access token expired." });
        }
        // did not provide token
        return res.status(401).send({ message: "Authentication failed. Bad credentials." });
    }
});

module.exports = router;
