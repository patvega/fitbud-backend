const express = require("express");
const router = express.Router();
const Refresh_Token = require("../models/refreshTokenSchema");
const jwt = require("jsonwebtoken");

/* Logging Out
Logging out is the process of finding and deleting the refresh token to prevent
minting new access tokens. When the user wants to access the application again,
they will need to login again. In doing so, they will get a new access token and
a new refresh token that will be valid for either 30 days or until they log out
(whichever short)
*/
router.post("/", async (req, res) => {
    // getting the token from the Authorization: Bearer <token> header and verifying it
    let token;
    try {
        token = req.get("Authorization").split(" ")[1];
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
        console.log("jwt verification failed: " + err.name);
        if (err instanceof jwt.TokenExpiredError) {
            return res.status(401).send({ message: "Authentication failed. Access token expired." });
        }
        // did not provide token
        return res.status(401).send({ message: "Authentication failed. Bad credentials." });
    }
    // console.log("/logout > token:", token);

    // getting userId from the JWT and using it to delete the refresh_token upon logout
    const { userId } = jwt.decode(token);
    const user = await Refresh_Token.findByIdAndDelete(userId);

    //if the userId isn't in the refresh_token collection we return an error
    if (!user) {
        console.log(`userId ${userId} failed to log out`);
        return res.status(404).send({ message: "User does not exist!" });
    }

    console.log(`userId ${userId} logged out successfully`);
    res.status(200).send({ message: "Logged out successfully!" });
});

module.exports = router;
