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
          const data = response.data.securities.data.filter((tickerData) => tickerData[1] === 'CETS');
          Object.keys(config.fiat).forEach((pair) => {
            const code = config.fiat[pair];
            const tickerData = _.findWhere(data, {
              2: code,
            });
            let price = (tickerData[14] + tickerData[15]) / 2;
            if (pair === 'JPY/RUB') price /= 100;
            rates[pair] = +price.toFixed(8);
            if (pair === 'USD/RUB') {
              rates['RUB/USD'] = +(1 / rates['USD/RUB']).toFixed(8);
            } else {
              const market = 'USD/' + pair.replace('/RUB', '');
              const price = rates['USD/RUB'] / rates[pair];
              rates[market] = +price.toFixed(8);
            }
          });
          log.log(`MOEX rates updated successfully`);
          cb(rates);
        } catch (e) {
          notify(`Unable to process data ${JSON.stringify(response.data)} from request to ${url}. Error: ${e}`, 'error');
          cb(false);
        }
      })
      .catch(function(error) {
        if (error.toString().includes('decryption failed or bad record mac')) {
          log.warn(`Request to MOEX ${url} failed: ${error.toString()}. Retrying…`);
          return module.exports(cb);
        } else {
          notify(`Request to ${url} failed with ${error.response?.status} status code, ${error.toString()}${error.response?.data ? '. Message: ' + JSON.stringify(error.response.data) : ''}.`, 'error');
          cb(false);
        }
      });
};
