const axios = require('axios');
const config = require('./configReader');
const log = require('./log');
const notify = require('./notify');

// https://github.com/fawazahmed0/exchange-api#readme
const url = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json';
// This service updates only once in 24h, so skip cryptos
const skipCoins = ['USD', 'BTC', 'ETH'];

module.exports = (cb) => {

  axios.get(url)
      .then(function(response) {
        try {
          const rates = {};
          const data = response.data.usd;
          config.baseCoins.forEach((currency) => {
            const rate = data[currency.toLowerCase()];
            if (!skipCoins.includes(currency) && rate) {
              rates['USD/' + currency.toUpperCase()] = +rate.toFixed(config.decimals);
              rates[currency.toUpperCase() + '/USD'] = +(1 / +rate).toFixed(config.decimals);
            }
          });
          log.log(`Currency-Api1 rates updated successfully`);
          cb(rates);
        } catch (e) {
          notify(`Unable to process data ${JSON.stringify(response.data)} from request to ${url}. Error: ${e}`, 'error');
          cb(false);
        }
      })
      .catch(function(error) {
        notify(`Request to ${url} failed with ${error.response?.status} status code, ${error.toString()}${error.response?.data ? '. Message: ' + JSON.stringify(error.response.data) : ''}.`, 'error');
        cb(false);
      });
};
