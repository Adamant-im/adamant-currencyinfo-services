const axios = require('axios');
const config = require('./configReader');
const log = require('./log');
const notify = require('./notify');
const _ = require('underscore');

/**
 * https://coinmarketcap.com/api/documentation/v1/#operation/getV1CryptocurrencyQuotesLatest
 * id: One or more comma-separated cryptocurrency CoinMarketCap IDs. Example: 1,2
 * slug: Alternatively pass a comma-separated list of cryptocurrency slugs. Example: "bitcoin,ethereum"
 * symbol: Alternatively pass one or more comma-separated cryptocurrency symbols.
 *    Example: "BTC,ETH". At least one "id" or "slug" or "symbol" is required for this request.
 * convert: Optionally calculate market quotes in up to 120 currencies at once by passing a comma-separated
 *    list of cryptocurrency or fiat currency symbols. Each additional convert option beyond the first
 *    requires an additional call credit. A list of supported fiat options can be found here. Each
 *    conversion is returned in its own "quote" object.
 * convert_id: Optionally calculate market quotes by CoinMarketCap ID instead of symbol. This option is
 *    identical to convert outside of ID format. Ex: convert_id=1,2781 would replace convert=BTC,USD in
 *    your query. This parameter cannot be used when convert is used.
 * Note: find id on a coin's webpage with "coinId":1027", "200x200/1027.png"
 * Note: find slug in a coin's URL like https://coinmarketcap.com/currencies/bitcoin/
 */
const url_base = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest';

function getCmcCoinIds() {

  config.crypto_cmc_full = [];
  if (!config.isCmc) return;

  const url = url_base + '?' +
    'symbol=' + config.crypto_cmc.join();
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
          config.crypto_cmc.forEach((ticker) => {
            const currency = _.findWhere(data, {
              symbol: ticker.toUpperCase(),
            });
            if (currency) {
              cmc_crypto = {
                symbol: ticker,
                cmc_id: currency.id,
              };
              config.crypto_cmc_full.push(cmc_crypto);
            }
          });
          Object.keys(config.crypto_cmc_coinids).forEach((ticker) => {
            cmc_crypto = {
              symbol: ticker.toUpperCase(),
              cmc_id: config.crypto_cmc_coinids[ticker],
            };
            config.crypto_cmc_full.push(cmc_crypto);
          });
          config.crypto_all = config.crypto_all.concat(config.crypto_cmc_full.map((crypto) => crypto.symbol));
          config.crypto_all = [...new Set(config.crypto_all)]; // Remove duplicates
          config.isCmcFull = true;
          log.log(`Coinmarketcap coin ids fetched successfully`);
        } catch (e) {
          notify(`Unable to process data ${JSON.stringify(response.data)} from request to ${url}. Unable to get Coinmarketcap coin ids. Try to restart InfoService or there will be no rates from Coinmarketcap. Error: ${e}`, 'error');
        }
      })
      .catch(function(error) {
        notify(`Request to ${url} failed with ${error.response?.status} status code, ${error.toString()}. Unable to get Coinmarketcap coin ids. Try to restart InfoService or there will be no rates from Coinmarketcap.`, 'error');
      });
}

getCmcCoinIds();

module.exports = (base, cb) => {

  if (!config.isCmcFull) {
    cb({});
    return;
  }

  const url = url_base + '?' +
    'id=' + config.crypto_cmc_full.map((currency) => currency.cmc_id).join(',') +
    '&convert=' + base;
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
          const unavailableList = [];
          config.crypto_cmc.forEach((ticker) => {
            const currency = _.findWhere(data, {
              symbol: ticker,
            });
            if (currency?.quote?.[base]?.price) {
              rates[ticker + '/' + base] = +currency.quote[base].price.toFixed(config.decimals);
            } else {
              unavailableList.push(ticker);
            }
          });
          if (unavailableList.length) {
            if (unavailableList.length === config.crypto_cmc.length) {
              notify(`Unable to get all of ${config.crypto_cmc.length} coin rates from request to ${url}. Check Coinmarketcap service and config file.`, 'error');
            } else {
              log.warn(`Coinmarketcap rates updated against ${base} successfully, except ${unavailableList.join(', ')}`);
            }
          } else {
            log.log(`Coinmarketcap rates updated against ${base} successfully`);
          }
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
