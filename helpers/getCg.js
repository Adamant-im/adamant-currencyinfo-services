const axios = require('axios');
const _ = require('underscore');
const config = require('./configReader');
const log = require('./log');
const notify = require('./notify');

function getCgCoinIds() {

  config.crypto_cg_full = [];
  if (!config.isCg) return;

  const url = 'https://api.coingecko.com/api/v3/coins/list';
  axios.get(url)
      .then(function(response) {
        try {
          const data = response.data;

          // Get coins by tickers as BTC
          config.crypto_cg.forEach((t) => {
            const currency = _.findWhere(data, {
              symbol: t.toLowerCase(),
            });

            cg_crypto = {
              symbol: t,
              cg_id: currency.id,
            },

            config.crypto_cg_full.push(cg_crypto);
          });

          // Get coins by ids as bitcoin
          config.crypto_cg_coinids.forEach((t) => {
            const currency = _.findWhere(data, {
              id: t,
            });

            if (currency?.symbol) {
              cg_crypto = {
                symbol: currency.symbol.toUpperCase(),
                cg_id: t,
              };

              config.crypto_cg_full.push(cg_crypto);
            } else {
              log.warn(`Unable to get ticker for Coingecko id '${t}'. Check if the coin exists: ${url}.`);
            }
          });

          config.crypto_all = config.crypto_all.concat(config.crypto_cg_full.map((e) => e.symbol));
          config.crypto_all = [...new Set(config.crypto_all)]; // Remove duplicates
          config.isCgFull = true;

          log.log(`Coingecko coin ids fetched successfully`);
        } catch (e) {
          notify(`Unable to process data '${JSON.stringify(response.data).substring(0, 100)}' from request to ${url}. Unable to get Coingecko coin ids. Try to restart InfoService or there will be no rates from Coingecko. Error: ${e}`, 'error');
        }
      })
      .catch(function(error) {
        notify(`Request to ${url} failed with ${error.response?.status} status code, ${error.toString()}. Unable to get Coingecko coin ids. Try to restart InfoService or there will be no rates from Coingecko.`, 'error');
      });
}

getCgCoinIds();

module.exports = (base, cb) => {

  if (!config.isCgFull) {
    cb({});
    return;
  }

  const params = {
    ids: config.crypto_cg_full.map((e) => e.cg_id).join(','), // join string by field cg_id
    vs_currencies: base,
  };

  const url = 'https://api.coingecko.com/api/v3/simple/price';

  axios.get(url, { params })
      .then(function(response) {
        try {
          const data = response.data;
          const rates = {};
          config.crypto_cg_full.forEach((t) => {
            rates[t['symbol'] + '/' + base] = +data[t['cg_id']][base.toLowerCase()].toFixed(8);
          });
          log.log(`Coingecko rates updated against ${base} successfully`);
          cb(rates);
        } catch (e) {
          notify(`Unable to process data ${JSON.stringify(response.data)} from request to ${url} ${JSON.stringify(params)}. Error: ${e}`, 'error');
          cb(false);
        }
      })
      .catch(function(error) {
        notify(`Request to ${url} ${JSON.stringify(params)} failed with ${error.response?.status} status code, ${error.toString()}${error.response?.data ? '. Message: ' + JSON.stringify(error.response.data) : ''}.`, 'error');
        cb(false);
      });

};
