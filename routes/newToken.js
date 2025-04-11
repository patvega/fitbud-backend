// In here, we need to test if the refresh token is still valid
// If not, then delete it from the database and logout the user on the client side.
const express = require("express");
const router = express.Router();
const Refresh_Token = require("../models/refreshTokenSchema");
const jwt = require("jsonwebtoken");

/* Getting a new Access Token
This is the functionality for minting a new access token by using a refresh token.
If the refresh token is valid, then create a new JWT access token for the user and send it back.
If it is not valid, send the user a 401 Unauthorized AND delete the existing refresh token from the database.
*/
router.post("/", async (req, res) => {
    const clientRefreshToken = req.body.refreshToken;
    try {
        // verify that the token is both a real token AND that the user has not logged out
        jwt.verify(clientRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const { userId } = jwt.decode(clientRefreshToken);
        if (!(await Refresh_Token.findById(userId))) {
            throw new Error("Refresh token invalidated.");
        }

        // passed checks, mint new access token and deliver to client
        const accessToken = jwt.sign({ userId: userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
        return res.send({ accessToken: accessToken });
    } catch (err) {
        // refresh token is invalid for some reason
        if (err instanceof jwt.TokenExpiredError) {
            // refresh token simply expired, so also delete it from the database
            const { userId } = jwt.decode(clientRefreshToken);
            let tokenObject = await Refresh_Token.findById(userId);
            if (tokenObject && clientRefreshToken === tokenObject.token) {
                await Refresh_Token.findByIdAndDelete(userId);
                return res.status(401).send({ message: "Grant expired. Please login again!" });
            } else {
                return res.status(401).send({ message: "Grant failed. Bad credentials." });
            }
        }
        if (err instanceof jwt.JsonWebTokenError) {
            // console.log("JsonWebTokenError");
            return res.status(401).send({ message: "Grant failed. Bad credentials." });
        }
        // any other kind of error
        return res.status(401).send({ message: "Grant failed. Bad credentials." });
    }
});

module.exports = router;
