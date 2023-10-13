const Mongoose = require("mongoose");

const userSchema = new Mongoose.Schema({
    image:{type:String},
    username:{type:String, required:true},
    email:{type:String, required:true,unique:true},
    password:{type:String, required:true},
    date:{type:String, required:true},
    key:{type:String, required:true},
})
const UserModel = Mongoose.model("users",userSchema);

module.exports = {UserModel};