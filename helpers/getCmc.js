const request = require('request');
const _ = require('underscore');
const config = require('./configReader');
const log = require('./log');
const notify = require('./notify');

module.exports = (base, cb) => {

    if (!config.crypto_cmc || config.crypto_cmc.length == 0 || !config.cmcApiKey) {
        cb({});
		return;
    }

	request(
		'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest', {
			qs: {
				symbol: config.crypto_cmc.join(),
				convert: base
			},
			headers: {
				'X-CMC_PRO_API_KEY': config.cmcApiKey
			},
			json: true,
		}, (err, res, body) => {
			if (err) {
				notify(`Unable to process request to pro-api.coinmarketcap.com`, 'error');
				cb(false);
				return;
			}
			try {
				const info = body.data;
				const data = {};
				config.crypto_cmc.forEach(t => {
					const currency = _.findWhere(info, {
						symbol: t
					});
					data[t + '/' + base] = +currency.quote[base].price.toFixed(8);
				});

				cb(data);
				log.info(`Coinmarketcap rates updated against ${base} successfully`)
			} catch (e) {
				notify(`Unable to process data from request to pro-api.coinmarketcap.com. Wrong Coinmarketcap API key? Error: ${e}`, 'error');
				cb(false);
			}

		});
};