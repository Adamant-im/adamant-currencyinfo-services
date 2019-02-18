const MongoClient = require("mongodb").MongoClient;

const mongoClient = new MongoClient("mongodb://localhost:27017/", {
    useNewUrlParser: true
});

let CurrencysDB;

mongoClient.connect((err, client)=>{
    const db = client.db("currencysdb");
    CurrencysDB = db.collection("currencys");
});

module.exports.save = (currencys, cb) => {
    CurrencysDB.insertOne({
        date: new Date().getTime(),
        currencys
    }, (err, result)=>{
        if (err)
            cb(false)
        else
            cb(result);
    });

}

module.exports.getHistory = (limit, cb) => {
    CurrencysDB.find({}).toArray((err, docs)=>{
        if (err)
            cb(false)
        else
            cb(docs);
    });
}