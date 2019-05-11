const MongoClient = require("mongodb").MongoClient;

const mongoClient = new MongoClient("mongodb://localhost:27017/", {
    useNewUrlParser: true
});

let CurrencysDB;

mongoClient.connect((err, client) => {
    if (err)
        throw (err);

    const db = client.db("currencysdb");
    CurrencysDB = db.collection("currencys");
});

module.exports.save = (currencys, cb) => {
    CurrencysDB.insertOne({
        date: new Date().getTime(),
        currencys
    }, (err, result) => {
        if (err)
            cb(false)
        else
            cb(result);
    });

}

module.exports.getHistory = (params, cb) => {
    let {limit, from, to, timestamp} = params;
    let q = {};
  
    if(from && to){
        q = { date: { $gte: +from * 1000, $lte: +to * 1000}};
        limit = limit || 10000000;
    }
    if(timestamp){
        q = {date:{$lte: timestamp * 1000}};
        limit = 1;
    }
    CurrencysDB.find(q)
     .sort({date: -1})
     .limit(limit)
     .toArray((err, docs) => {
        if (err){
            cb(false)
        } else {
            cb(docs);
        }
    })
}