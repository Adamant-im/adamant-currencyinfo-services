const tickers = {};
const Moex = require('./helpers/getMoex');
const Cmc = require('./helpers/getCmc');
const _ = require('underscore');
const router = require('./modules/router');
const {
	refreshInterval,
	baseCoins,
	crypto
} = require('./config.json');

const db = require('./db/mongodb');

router(tickers);

function refresh () {
	console.log('------------ Update -------------');
	Moex(data => {
		if (data){
			Object.assign(tickers, data);
		}

		Cmc('USD', data => {
			if (data){
				Object.assign(tickers, data);
			}

			converter(tickers);
			console.log(tickers);

			db.save(tickers, (res) => {
				if (res)
				{console.log('Success saved tickers');}
				else
				{console.log('Error saved tickers');}
			});
		});
	});
}

refresh();

setInterval(refresh, refreshInterval * 60000);

function converter (tickers) {
	baseCoins.forEach(b => {
		const price = tickers['USD/' + b] || 1 / tickers[b + '/USD'];
		if (!price) {return;}
		crypto.forEach(c => {
			const priceAlt = 1 / tickers[c + '/USD'];
			tickers[c + '/' + b] = +(price / priceAlt).toFixed(8);
		});
	});
}