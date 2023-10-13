const {MongoClient} = require('mongodb');
const url = 'mongodb://localhost:27017';
const database = 'drive';
const client =  new MongoClient(url);
async function MongoDb(){
    let result = await client.connect();
    return await result.db(database);
}

module.exports = MongoDb;