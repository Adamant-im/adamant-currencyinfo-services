const db = require('../db/mongodb');
const express = require('express');
const app = express();
var bodyParser = require('body-parser');
const port = require('../config.json').port;
let currencys;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

app.get('/get', (req, res) => {
	let coins = req.query.coin;
	if (!coins) {
		res.json(respSuccess(currencys));
	} else {
		coins = coins.toUpperCase();
		const filterredCurrencys = {};
		let arrCoins = [coins];
		if (~coins.indexOf(',')) {
			arrCoins = coins.split(',');
		}
		arrCoins.forEach(coin => {
			const filteredMarkets = Object.keys(currencys).filter(c => ~c.indexOf(coin.trim()));
			filteredMarkets.forEach(c => filterredCurrencys[c] = currencys[c]);
		});
		res.json(respSuccess(filterredCurrencys));
	}
});

app.get('/getHistory', (req, res) => {
	db.getHistory(req.query, (h) => {
		res.json(respSuccess(h));
	});
});
module.exports = (currencys_) => {
	currencys = currencys_;
};

app.listen(port, () => console.info('ADAMANT-INFO server listening on port ' + port));

function respSuccess (data) {
	return {
		success: true,
		date: new Date().getTime(),
		result: data
	};
}