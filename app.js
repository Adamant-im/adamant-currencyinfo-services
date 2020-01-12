const tickers = {};
const Moex = require('./helpers/getMoex');
const Cmc = require('./helpers/getCmc');
const Cc = require('./helpers/getCc');
const Cg = require('./helpers/getCg');
const _ = require('underscore');
const router = require('./modules/router');
const config = require('./helpers/configReader');
const log = require('./helpers/log');
const db = require('./db/mongodb');
const notify = require('./helpers/notify');
let fetched;

router(tickers);

function refresh () {
		
	log.info('------------ Rates update started -------------');
	
	fetched = true;
	Cmc('USD', data => {
		if (data) {
			Object.assign(tickers, data);
		} else {
			fetched = false;
			notify(`Error: Unable to get data from Coinmarketcap. InfoService will provide previous rates; historical rates wouldn't be saved.`, 'error');
		}

		Moex(data => {
			if (data) {
				Object.assign(tickers, data);
			} else {
				fetched = false;
				notify(`Error: Unable to get data from MOEX. InfoService will provide previous rates; historical rates wouldn't be saved.`, 'error');
			}

			Cc('USD', data => {
				if (data) {
					Object.assign(tickers, data);
				} else {
					fetched = false;
					notify(`Error: Unable to get data from CryptoCompare. InfoService will provide previous rates; historical rates wouldn't be saved.`, 'error');
				}

				Cg('USD', data => {
					if (data) {
						Object.assign(tickers, data);
					} else {
						fetched = false;
						notify(`Error: Unable to get data from Coingecko. InfoService will provide previous rates; historical rates wouldn't be saved.`, 'error');
					}
	
					converter(tickers);
					if (fetched) {
						try {
							db.save(tickers);
							log.info('New rates from all sources saved successfully');
						} catch (e) {
							notify(`Error: Unable to save new rates in history database: ${e}`, 'error');
						}
					}
				}); // Coingecko
			}); // Cryptocompare
		}); // Moex
	}); // Coinmarketcap

} // refresh

setTimeout(refresh, 5000);
setInterval(refresh, config.refreshInterval * 60000);

function converter (tickers) {
	config.baseCoins.forEach(b => {
		const price = tickers['USD/' + b] || 1 / tickers[b + '/USD'];
		if (!price) {return;}
		config.crypto_all.forEach(c => {
			const priceAlt = 1 / tickers[c + '/USD'];
			tickers[c + '/' + b] = +(price / priceAlt).toFixed(8);
		});
	});
}