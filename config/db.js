const mongoose = require("mongoose")

async function Mongoose(DATABASE_URL){
    const DATABASE_NAME = "Google-Drive";
    return await mongoose.connect(`${DATABASE_URL}/${DATABASE_NAME}`)
}

module.exports = Mongoose;