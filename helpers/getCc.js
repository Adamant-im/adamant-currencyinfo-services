const request = require('request');
const _ = require('underscore');
const config = require('./configReader');
const log = require('./log');
const notify = require('./notify');

module.exports = (base, cb) => {

    if (!config.crypto_cc || config.crypto_cc.length == 0 || !config.ccApiKey) {
        cb({});
		return;
    }

	request(
		'https://min-api.cryptocompare.com/data/pricemulti', {
			qs: {
				fsyms: config.crypto_cc.join(),
				tsyms: base,
                api_key: config.ccApiKey
			},
			json: true,
		}, (err, res, body) => {
			if (err) {
				notify(`Unable to process request to min-api.cryptocompare.com`, 'error');
				cb(false);
				return;
			}
			try {
                const info = body;
				const data = {}; 
				config.crypto_cc.forEach(t => {
					data[t + '/' + base] = +info[t][base].toFixed(8);
				});

				cb(data);
				log.info(`CryptoCompare rates updated against ${base} successfully`)
			} catch (e) {
				notify(`Unable to process data from request to min-api.cryptocompare.com. Wrong CryptoCompare API key? Error: ${e}`, 'error');
				cb(false);
			}

		});
};