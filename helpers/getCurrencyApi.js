const axios = require('axios');
const config = require('./configReader');
const log = require('./log');
const notify = require('./notify');

// https://github.com/fawazahmed0/currency-api#readme
const url1 = 'https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/usd.json';
// https://github.com/Formicka/exchangerate.host
const url2 = 'https://api.exchangerate.host/latest?base=USD';
// This service updates only once in 24h, so skip cryptos
const skipCoins = ['USD', 'BTC', 'ETH'];

function parseSource1(response) {
  const rates = {};
  const data = response.data.usd;
  config.baseCoins.forEach((currency) => {
    const rate = data[currency.toLowerCase()];
    if (!skipCoins.includes(currency) && rate) {
      rates['USD/' + currency.toUpperCase()] = +rate.toFixed(8);
      rates[currency.toUpperCase() + '/USD'] = +(1 / +rate).toFixed(8);
    }
  });
  return rates;
}

function parseSource2(response) {
  const rates = {};
  const data = response.data.rates;
  config.baseCoins.forEach((currency) => {
    const rate = data[currency.toUpperCase()];
    if (!skipCoins.includes(currency) && rate) {
      rates['USD/' + currency.toUpperCase()] = +rate.toFixed(8);
      rates[currency.toUpperCase() + '/USD'] = +(1 / +rate).toFixed(8);
    }
  });
  return rates;
}

module.exports = (cb) => {

  axios.get(url1)
      .then(function(response) {
        try {
          const result = parseSource1(response);
          log.log(`Cryptocurrency-Api rates updated successfully`);
          cb(result);
        } catch (e) {
          notify(`Unable to process data ${JSON.stringify(response.data)} from request to ${url1}. Error: ${e}`, 'error');
        }
      })
      .catch(function(error) {
        notify(`Request to ${url1} failed with ${error.response?.status} status code, ${error.toString()}${error.response?.data ? '. Message: ' + JSON.stringify(error.response.data) : ''}.`, 'error');
        axios.get(url2)
            .then(function(response) {
              try {
                const result = parseSource2(response);
                log.log(`Cryptocurrency-Api rates updated successfully`);
                cb(result);
              } catch (e) {
                notify(`Unable to process data ${JSON.stringify(response.data)} from request to ${url2}. Error: ${e}`, 'error');
                cb(false);
              }
            })
            .catch(function(error) {
              notify(`Request to ${url2} failed with ${error.response?.status} status code, ${error.toString()}${error.response?.data ? '. Message: ' + JSON.stringify(error.response.data) : ''}.`, 'error');
              cb(false);
            });
      });
};
