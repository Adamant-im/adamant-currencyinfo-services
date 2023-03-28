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

  config.decimals = config.decimals || 10;
  config.isCc = config.crypto_cc?.length && config.ccApiKey;
  config.isCg = (config.crypto_cg?.length) || (config.crypto_cg_coinids?.length) && config.cgApiKey;
  config.isCmc = (config.crypto_cmc?.length || config.crypto_cmc_coinids?.length) && config.cmcApiKey;
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
