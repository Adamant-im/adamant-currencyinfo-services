const request = require('request');
const _ = require('underscore');
const config = require('./configReader');
const log = require('./log');
const notify = require('./notify');

function getCgCoinIds() {

    config.crypto_cg_full = [];

    if ((!config.crypto_cg || config.crypto_cg.length == 0) && (!config.crypto_cg_coinids || config.crypto_cg_coinids.length == 0)) {
		return;
    }

    request(
		'https://api.coingecko.com/api/v3/coins/list', {
			json: true,
		}, (err, res, body) => {
			if (err) {
				notify(`Unable to get Coingecko coin ids. Try to restart InfoService or there will be no rates from Coingecko.`, 'error');
				return;
			}
			try {
				const info = body;
				config.crypto_cg.forEach(t => {
					const currency = _.findWhere(info, {
						symbol: t.toLowerCase()
                    });
                    cg_crypto = {
                        symbol: t,
                        cg_id: currency.id
                    }
                    config.crypto_cg_full.push(cg_crypto)
				});
				config.crypto_cg_coinids.forEach(t => {
					const currency = _.findWhere(info, {
						id: t
                    });
                    cg_crypto = {
                        symbol: currency.symbol.toUpperCase(),
                        cg_id: t
                    }
                    config.crypto_cg_full.push(cg_crypto)
                });
                config.crypto_all = config.crypto_all.concat(config.crypto_cg_full.map(e => e.symbol));
                
                log.info(`Coingecko coin ids fetched successfully`)
			} catch (e) {
				notify(`Unable to get Coingecko coin ids. Try to restart InfoService or there will be no rates from Coingecko. Error: ${e}`, 'error');
			}

		});
    
}

getCgCoinIds();

module.exports = (base, cb) => {

    if (!config.crypto_cg_full || config.crypto_cg_full.length == 0) {
        cb({});
		return;
    }

	request(
		'https://api.coingecko.com/api/v3/simple/price', {
			qs: {
				ids: config.crypto_cg_full.map(e => e.cg_id).join(","), // join string by field cg_id
				vs_currencies: base
			},
			json: true,
		}, (err, res, body) => {
			if (err) {
				notify(`Unable to process request to api.coingecko.com`, 'error');
				cb(false);
				return;
			}
			try {
				const info = body;
				const data = {};
				config.crypto_cg_full.forEach(t => {
                    data[t['symbol'] + '/' + base] = +info[t['cg_id']][base.toLowerCase()].toFixed(8);
				});

				cb(data);
				log.info(`Coingecko rates updated against ${base} successfully`)
			} catch (e) {
				notify(`Unable to process data from request to api.coingecko.com. Error: ${e}`, 'error');
				cb(false);
			}

		});
};