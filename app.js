const Moex = require('./helpers/getMoex');
const CurrencyApi1 = require('./helpers/getCurrencyApi1');
const CurrencyApi2 = require('./helpers/getCurrencyApi2');
const Cmc = require('./helpers/getCmc');
const Cc = require('./helpers/getCc');
const Cg = require('./helpers/getCg');
const router = require('./modules/router');
const config = require('./helpers/configReader');
const log = require('./helpers/log');
const utils = require('./helpers/utils');
const db = require('./db/mongodb');
const notify = require('./helpers/notify');
let fetchedAll;

let tickers = {};
let tickersInfo;

function refresh() {

  log.log('Updating rates…');
  fetchedAll = true;
  tickers = {};

  CurrencyApi1((data) => {
    if (data) {
      tickersInfo = mergeData({}, data, 'Null', 'CurrencyApi1');
      if (tickersInfo.isAlert) {
        notify(`Error: rates from different sources significantly differs: ${tickersInfo.alertString}. InfoService will provide previous rates; historical rates wouldn't be saved.`, 'error');
        fetchedAll = false;
      } else {
        tickers = tickersInfo.merged;
      }
    } else {
      fetchedAll = false;
      notify(`Error: Unable to get data from CurrencyApi1. InfoService will provide previous rates; historical rates wouldn't be saved.`, 'error');
    }

    CurrencyApi2((data) => {
      if (data) {
        tickersInfo = mergeData({}, data, 'CurrencyApi1', 'CurrencyApi2');
        if (tickersInfo.isAlert) {
          notify(`Error: rates from different sources significantly differs: ${tickersInfo.alertString}. InfoService will provide previous rates; historical rates wouldn't be saved.`, 'error');
          fetchedAll = false;
        } else {
          tickers = tickersInfo.merged;
        }
      } else {
        fetchedAll = false;
        notify(`Error: Unable to get data from CurrencyApi2. InfoService will provide previous rates; historical rates wouldn't be saved.`, 'error');
      }
    });

    Cmc('USD', (data) => {
      if (data) {
        tickersInfo = mergeData(tickers, data, 'CurrencyApi1+CurrencyApi2', 'Cmc');
        if (tickersInfo.isAlert) {
          notify(`Error: rates from different sources significantly differs: ${tickersInfo.alertString}. InfoService will provide previous rates; historical rates wouldn't be saved.`, 'error');
          fetchedAll = false;
        } else {
          tickers = tickersInfo.merged;
        }
      } else {
        fetchedAll = false;
        notify(`Error: Unable to get data from Coinmarketcap. InfoService will provide previous rates; historical rates wouldn't be saved.`, 'error');
      }

      Moex((data) => {
        if (data) {
          tickersInfo = mergeData(tickers, data, 'CurrencyApi1+CurrencyApi2+Cmc', 'Moex');
          if (tickersInfo.isAlert) {
            notify(`Error: rates from different sources significantly differs: ${tickersInfo.alertString}. InfoService will provide previous rates; historical rates wouldn't be saved.`, 'error');
            fetchedAll = false;
          } else {
            tickers = tickersInfo.merged;
          }
        } else {
          fetchedAll = false;
          notify(`Error: Unable to get data from MOEX. InfoService will provide previous rates; historical rates wouldn't be saved.`, 'error');
        }

        Cc('USD', (data) => {
          if (data) {
            tickersInfo = mergeData(tickers, data, 'CurrencyApi1+CurrencyApi2+Cmc+Moex', 'Cc');
            if (tickersInfo.isAlert) {
              notify(`Error: rates from different sources significantly differs: ${tickersInfo.alertString}. InfoService will provide previous rates; historical rates wouldn't be saved.`, 'error');
              fetchedAll = false;
            } else {
              tickers = tickersInfo.merged;
            }
          } else {
            fetchedAll = false;
            notify(`Error: Unable to get data from CryptoCompare. InfoService will provide previous rates; historical rates wouldn't be saved.`, 'error');
          }

          Cg('USD', (data) => {
            if (data) {
              tickersInfo = mergeData(tickers, data, 'CurrencyApi1+CurrencyApi2+Cmc+Moex+Cc', 'Cg');
              if (tickersInfo.isAlert) {
                notify(`Error: rates from different sources significantly differs: ${tickersInfo.alertString}. InfoService will provide previous rates; historical rates wouldn't be saved.`, 'error');
                fetchedAll = false;
              } else {
                tickers = tickersInfo.merged;
              }
            } else {
              fetchedAll = false;
              notify(`Error: Unable to get data from Coingecko. InfoService will provide previous rates; historical rates wouldn't be saved.`, 'error');
            }

            converter(tickers);
            if (fetchedAll) {
              try {
                db.save(tickers);
                router(Object.assign({}, tickers));
                log.info('Rates from all sources saved successfully');
              } catch (e) {
                notify(`Error: Unable to save new rates in history database: ${e}`, 'error');
              }
            }
          }); // Coingecko
        }); // Cryptocompare
      }); // Moex
    }); // Coinmarketcap
  }); // CurrencyApi1

} // refresh

setTimeout(refresh, 5000);
setInterval(refresh, config.refreshInterval * 60000);

/**
 * Merges two objects, containing rates. If both have same ticker, validate its value.
 * @param {Object} tickers1 Object 1 with rates
 * @param {Object} tickers2 Object 2 with rates
 * @param {String} source1 Object 1 source, e. g., Cmc
 * @param {String} source2 Object 2 source
 * @return {Object} Merged object with rates, and alertString
 */
function mergeData(tickers1, tickers2, source1, source2) {
  const merged = Object.assign({}, tickers1, tickers2);
  const alertTickers = [];
  Object.keys(merged).forEach((m) => {
    if (utils.isPositiveOrZeroNumber(tickers1[m]) && utils.isPositiveOrZeroNumber(tickers2[m])) {
      const diff = utils.numbersDifferencePercent(tickers1[m], tickers2[m]);
      if (diff > config.rateDifferencePercentThreshold) {
        alertTickers.push(`**${m}** ${diff.toFixed(0)}%: ${+tickers1[m].toFixed(config.decimals)} (${source1}) — ${+tickers2[m].toFixed(config.decimals)} (${source2})`);
      }
    }
  });
  return {
    merged,
    isAlert: alertTickers.length > 0,
    alertString: alertTickers.join(', '),
  };
}

/**
 * Calculates rates for each base coin using USD rate
 * Modifies tickers object
 * @param {Object} tickers Rates object
 */
function converter(tickers) {
  config.baseCoins.forEach((b) => {
    const price = tickers['USD/' + b] || 1 / tickers[b + '/USD'];
    if (!price) return;
    config.crypto_all.forEach((c) => {
      const priceAlt = 1 / tickers[c + '/USD'];
      tickers[c + '/' + b] = +(price / priceAlt).toFixed(config.decimals);
    });
  });
}
