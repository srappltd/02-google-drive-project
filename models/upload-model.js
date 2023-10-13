const mongoose = require('mongoose');

const uploadSchema = new mongoose.Schema({
    data:{type:String},
    date:{type:String,required:true},
    path:{type:String,required:true},
    key:{type:String,required:true},
    uuid:{type:String,required:true},
    type:{type:String,required:true},
    size:{type:String},
});
const uploadModel = mongoose.model("uploads", uploadSchema);

module.exports = {uploadModel};