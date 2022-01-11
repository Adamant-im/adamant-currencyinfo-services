const axios = require('axios');
const config = require('./configReader');
const log = require('./log');
const notify = require('./notify');
const _ = require('underscore');

const url = 'https://iss.moex.com/iss/engines/currency/markets/selt/securities.jsonp';

module.exports = (cb) => {

  axios.get(url)
      .then(function(response) {
        try {
          const rates = {};
          const data = response.data.securities.data;
          Object.keys(config.fiat).forEach((m) => {
            const code = config.fiat[m];
            const c = _.findWhere(data, {
              2: code,
            });
            let price = (c[14] + c[15]) / 2;
            if (m === 'JPY/RUB') price /= 100;
            rates[m] = +price.toFixed(8);
            if (m === 'USD/RUB') {
              rates['RUB/USD'] = +(1 / rates['USD/RUB']).toFixed(8);
            } else {
              const market = 'USD/' + m.replace('/RUB', '');
              const price = rates['USD/RUB'] / rates[m];
              rates[market] = +price.toFixed(8);
            }
          });
          cb(rates);
          log.log(`MOEX rates updated successfully`);
        } catch (e) {
          notify(`Unable to process data ${JSON.stringify(response.data)} from request to ${url}. Error: ${e}`, 'error');
          cb(false);
        }
      })
      .catch(function(error) {
        notify(`Request to ${url} failed with ${error.response?.status} status code, ${error.toString()}${error.response?.data ? '. Message: ' + error.response.data.toString().trim() : ''}.`, 'error');
        cb(false);
      });
};
