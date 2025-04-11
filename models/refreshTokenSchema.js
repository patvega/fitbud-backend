const mongoose = require("mongoose");
const refresh_token_schema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model("Refresh_Token", refresh_token_schema);
