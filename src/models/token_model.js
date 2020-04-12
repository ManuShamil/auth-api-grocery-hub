const mongoose = require('mongoose')

const Schema = mongoose.Schema

const TokenSchema = new Schema({
    userID: { type: Number, required: true},
    token: { type: String, required: true}
})


module.exports = mongoose.model("token", TokenSchema);