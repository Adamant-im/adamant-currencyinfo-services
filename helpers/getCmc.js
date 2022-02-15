const axios = require('axios');
const config = require('./configReader');
const log = require('./log');
const notify = require('./notify');
const _ = require('underscore');

const url_base = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest';

module.exports = (base, cb) => {

  if (!config.isCmc) {
    cb({});
    return;
  }

  const url = url_base + '?' + 'symbol=' + config.crypto_cmc.join() + '&convert=' + base;
  const httpOptions = {
    url,
    method: 'get',
    timeout: 10000,
    headers: {
      'X-CMC_PRO_API_KEY': config.cmcApiKey,
    },
  };

  axios(httpOptions)
      .then(function(response) {
        try {
          const data = response.data.data;
          const rates = {};
          config.crypto_cmc.forEach((t) => {
            const currency = _.findWhere(data, {
              symbol: t,
            });
            rates[t + '/' + base] = +currency.quote[base].price.toFixed(8);
          });
          log.log(`Coinmarketcap rates updated against ${base} successfully`);
          cb(rates);
        } catch (e) {
          notify(`Unable to process data ${JSON.stringify(response.data)} from request to ${url}. Wrong Coinmarketcap API key? Error: ${e}`, 'error');
          cb(false);
        }
      })
      .catch(function(error) {
        notify(`Request to ${url} failed with ${error.response?.status} status code, ${error.toString()}${error.response?.data ? '. Message: ' + JSON.stringify(error.response.data) : ''}.`, 'error');
        cb(false);
      });
};
