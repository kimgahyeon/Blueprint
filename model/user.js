const mongoose = require('mongoose');

const User_Schema = new mongoose.Schema({
    userID : String,
    password_hash : String,
    email : String,
    information : String,
    account : String
})      

//db.users.find()
module.exports = mongoose.model('User',User_Schema);