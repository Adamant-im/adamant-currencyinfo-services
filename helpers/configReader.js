const jsonminify = require('jsonminify');
const fs = require('fs');
const isDev = process.argv.includes('dev');
let config = {};

try {

  if (isDev) {
    config = JSON.parse(jsonminify(fs.readFileSync('./config.test', 'utf-8')));
  } else {
    config = JSON.parse(jsonminify(fs.readFileSync('./config.json', 'utf-8')));
  }

  config.isCc = config.crypto_cc?.length !== 0 && config.ccApiKey;
  config.isCg = (config.crypto_cg?.length !== 0) || (config.crypto_cg_coinids?.length !== 0);
  config.isCmc = (config.crypto_cmc?.length !== 0 || config.crypto_cmc_coinids?.length !== 0) && config.cmcApiKey;
  config.version = require('../package.json').version;
  config.isDev = isDev;
  // Also, Coingecko coins will be added in getCg module and Coinmarketcap in getCmc
  config.crypto_all = [].concat(config.crypto_cc);
  console.info(`InfoService successfully read a config-file${isDev ? ' (dev)' : ''}.`);

} catch (e) {
  console.error('Error reading config: ' + e);
  process.exit(-1);
}

module.exports = config;
