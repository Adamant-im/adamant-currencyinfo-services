const MongoClient = require('mongodb').MongoClient;
const mongoClient = new MongoClient('mongodb://127.0.0.1:27017/', { useNewUrlParser: true, useUnifiedTopology: true, serverSelectionTimeoutMS: 3000 });
const log = require('../helpers/log');

let TickersDB;

mongoClient.connect((error, client) => {

  if (error) {
    log.error(`Unable to connect to MongoBD, ` + error);
    process.exit(-1);
  }
  const db = client.db('tickersdb');
  TickersDB = db.collection('tickers');
  log.log(`InfoService successfully connected to 'tickersdb' MongoDB.`);

});

module.exports.save = (tickers) => {
  TickersDB.insertOne({
    date: new Date().getTime(),
    tickers,
  });
};

module.exports.getHistory = (params, cb) => {
  try {
    if (!Object.keys(params).length) {
      cb(false, 'Provide parameters for getHistory request');
      return;
    }

    let { limit, from, to, timestamp, coin } = params;
    const q = {};

    if (from && to) {
      q.date = { $gte: +from * 1000, $lte: +to * 1000 };
      limit = limit || 100;
      if (+from > +to) {
        cb(false, `Wrong time interval: 'to' should be more, than 'from'`);
        return;
      }
    }
    if (timestamp) {
      q.date = { $lte: timestamp * 1000 };
      limit = 1;
    }
    limit = Math.min(100, limit);

    TickersDB.find(q)
        .sort({ date: -1 })
        .limit(+limit)
        .toArray((err, docs) => {
          if (err) {
            cb(false, err);
          } else {
            if (coin) {
              docs.tickers = docs.forEach((d) =>{
                Object.keys(d.tickers).forEach((pair) =>{
                  if (!~pair.indexOf(coin)) {
                    delete d.tickers[pair];
                  }
                });
              });
            }
            cb(docs);
          }
        });
  } catch (e) {
    cb(false, e);
    log.error('Error at getHistory(): ', params, e);
  }
};
