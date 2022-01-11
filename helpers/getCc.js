const axios = require('axios');
const config = require('./configReader');
const log = require('./log');
const notify = require('./notify');

const url = 'https://min-api.cryptocompare.com/data/pricemulti';

module.exports = (base, cb) => {

  if (!config.isCc) {
    cb({});
    return;
  }

  const params = {
    fsyms: config.crypto_cc.join(),
    tsyms: base,
    api_key: config.ccApiKey,
  };

  axios.get(url, { params })
      .then(function(response) {
        try {
          const data = response.data;
          const rates = {};
          config.crypto_cc.forEach((t) => {
            rates[t + '/' + base] = +data[t][base].toFixed(8);
          });
          cb(rates);
          log.log(`CryptoCompare rates updated against ${base} successfully`);
        } catch (e) {
          notify(`Unable to process data ${JSON.stringify(response.data)} from request to ${url} ${JSON.stringify(params)}. Wrong CryptoCompare API key? Error: ${e}`, 'error');
          cb(false);
        }
      })
      .catch(function(error) {
        console.log('rates1');
        notify(`Request to ${url} ${JSON.stringify(params)} failed with ${error.response?.status} status code, ${error.toString()}${error.response?.data ? '. Message: ' + error.response.data.toString().trim() : ''}.`, 'error');
        cb(false);
        return;
      });
};
