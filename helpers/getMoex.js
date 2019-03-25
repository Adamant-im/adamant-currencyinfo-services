const request = require('request');
const _ = require('underscore');
const fiat = require('../config.json').fiat; 

module.exports = (cb) => {
    request('https://iss.moex.com/iss/engines/currency/markets/selt/securities.jsonp', {json: true},(err, response, body) => {
        try {
            if (err) {
                cb(err);
                return;
			}
            const data = {};
            const info = body.securities.data;
            Object.keys(fiat).forEach(m => {
                const code = fiat[m];
                const c = _.findWhere(info, {
                    2: code
				});
                let price = (c[14] + c[15]) / 2;
				if(m ==='JPY/RUB') price /= 100;
				data[m] = +price.toFixed(8);
				if (m == 'USD/RUB') {
                    data['RUB/USD'] = +(1 / data['USD/RUB']).toFixed(8);
					} else {
                    const market = 'USD/' + m.replace('/RUB', '');
                    const price = data['USD/RUB'] / data[m];
                    data[market] = +price.toFixed(8);
				}
			});
            cb(data);
			} catch (e) {
            console.log('Err get Moex: ', e);
            cb(false);
		}
	});
}
