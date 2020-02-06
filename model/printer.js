const mongoose = require('mongoose');

const Printer_Schema = new mongoose.Schema({
    model : String,
    buyer : String,
    location : String
})      

//db.users.find()
module.exports = mongoose.model('Printer',Printer_Schema);