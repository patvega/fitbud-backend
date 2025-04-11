const mongoose = require("mongoose");
const user_schema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },

    saltedHashedPass: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model("User", user_schema);
