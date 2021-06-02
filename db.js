const MongoClient = require('mongodb').MongoClient;

const uri = "mongodb+srv://eithan:admin1234@cluster0.fa45z.mongodb.net/gpsGateLocations?retryWrites=true&w=majority";
let _db=null;

//akivas database
let a_db;
const MongoConnect = callback => {
    MongoClient.connect("mongodb://127.0.0.1:27017'")
        .then(client => {
            console.log("mongo connected");
            a_db = client.db();
            callback();
        })
        .catch(err => {
            console.log(err);
            throw err;
        });
}


const getDB = () => {
    if(a_db){
        return (a_db);
    }
    //throw "No DB found";
    console.log("no db!")
    //throw here!! catch somewher else
}

module.exports = {
    connectToDB: function (callback) {
        MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true },((err,client) => {
           if(err){
               console.log(err);
               return;
           }
            _db = client.db("GPSGATE_LOCATION");
            return callback(err,client);
        }));
    },
    getDB:function(){
        return _db;
    },

    MongoConnect: MongoConnect,
    getAkivasDb: getDB

};

