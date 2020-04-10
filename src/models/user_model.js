const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const Schema = mongoose.Schema

const UserSchema = new Schema({
    userID: { type: Number, unique: true},
    userName: { type: String, required: true },
    userEmail: { type: String, required: true},
    userPassword: { type: String, required: true }
})

/*
*   We do not use save in this Schema on /auth route.
*   
*
*    UserSchema.pre('save', function(next) {
*
*       if(!this.isModified("userPassword")) {
*            return next(); 
*        }
*
*        counterModel.findOneAndUpdate({ _id: 'userid' }, {$inc: { seq: 1 } }, { upsert: true, new: true, setDefaultsOnInsert: true }, (err, counter) => {
*
*            this.userID = counter.seq //assign autoIncremented value
*            this.userPassword = bcrypt.hashSync(this.userPassword, 10); //hash the password
*
*            next();
*
*        })
*    })
*/


UserSchema.methods.comparePassword = function(plaintext, callback) {
    return callback(null, bcrypt.compareSync(plaintext, this.userPassword));
}

module.exports = mongoose.model("User", UserSchema);