const request = require('request');
const _ = require('underscore');
const {crypto, cmcApiKey} = require('../config.json');

module.exports = (base, cb) => {
    request(
	'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest', {
		qs: {
			start: 1,
			limit: 5000,
			convert: base
		},
		headers: {
			'X-CMC_PRO_API_KEY': cmcApiKey
		},
		json: true,
        }, (err, res, body) => {
		if (err) {
			cb(false);
			return;
		}
		try {
			const info = body.data;
			const data = {};
			crypto.forEach(t => {
				const currency = _.findWhere(info, {
					symbol: t
				});	
				data[t + '/' + base] = +currency.quote[base].price.toFixed(8);
			});
			
			cb(data);
			console.log('update', base);
            } catch (e) {
			console.log('Error: ' + e)
			cb(false);
		}
		
	});
};