const {MongoClient} = require('mongodb');
require("dotenv").config()
const url = process.env.MONGODB_URL;
const database = 'Google-Drive';
const client =  new MongoClient(url);
async function MongoDb(){
    let result = await client.connect();
    return await result.db(database);
}

module.exports = MongoDb;