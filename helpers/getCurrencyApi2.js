const axios = require('axios');
const config = require('./configReader');
const log = require('./log');
const notify = require('./notify');

// https://github.com/Formicka/exchangerate.host
const url = 'https://api.exchangerate.host/latest?base=USD';
// This service doesn't include crypto except Bitcoin
// Also, it sometimes provides chicken digits, like 47k usd for Bitcoin instead of 16k, and 73 rub/usd instead of 60
// Good we have built-in check system
const skipCoins = ['USD', 'ETH'];

module.exports = (cb) => {
  if (config.skipApi?.ExchangeRate) {
    log.log(`Currency-Api2 rates skipped because of config set up`);
    cb({});
  } else {
    axios.get(url)
        .then(function(response) {
          try {
            const rates = {};
            const data = response.data.rates;
            config.baseCoins.forEach((currency) => {
              const rate = data[currency.toUpperCase()];
              if (!skipCoins.includes(currency) && rate) {
                rates['USD/' + currency.toUpperCase()] = +rate.toFixed(config.decimals);
                rates[currency.toUpperCase() + '/USD'] = +(1 / +rate).toFixed(config.decimals);
              }
            });
            log.log(`Currency-Api2 rates updated successfully`);
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
  }
};
