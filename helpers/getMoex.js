const request = require('request');
const _ = require('underscore');
const config = require('./configReader');
const log = require('./log');
const notify = require('./notify');

module.exports = (cb) => {
	request('https://iss.moex.com/iss/engines/currency/markets/selt/securities.jsonp', {json: true}, (err, response, body) => {
		try {
			if (err) {
				notify(`Unable to process request to iss.moex.com`, 'error');
				cb(false);
				return;
			}
			const data = {};
			const info = body.securities.data;
			Object.keys(config.fiat).forEach(m => {
				const code = config.fiat[m];
				const c = _.findWhere(info, {
					2: code
				});
				let price = (c[14] + c[15]) / 2;
				if (m === 'JPY/RUB') 
					price /= 100;
				data[m] = +price.toFixed(8);
				if (m === 'USD/RUB') {
					data['RUB/USD'] = +(1 / data['USD/RUB']).toFixed(8);
				} else {
					const market = 'USD/' + m.replace('/RUB', '');
					const price = data['USD/RUB'] / data[m];
					data[market] = +price.toFixed(8);
				}
			});
			cb(data);
			log.info(`MOEX rates updated successfully`)
		} catch (e) {
			notify(`Unable to process request to iss.moex.com. Error: ${e}`, 'error');
			cb(false);
		}
	});
};
