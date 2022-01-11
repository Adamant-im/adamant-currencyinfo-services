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

  config.isCc = config.crypto_cc && config.crypto_cc.length !== 0 && config.ccApiKey;
  config.version = require('../package.json').version;
  config.isDev = isDev;
  config.crypto_all = config.crypto_cmc.concat(config.crypto_cc); // Also, Coingecko coins will be added in getCg module
  console.info(`InfoService successfully read a config-file${isDev ? ' (dev)' : ''}.`);

} catch (e) {
  console.error('Error reading config: ' + e);
  process.exit(-1);
}

module.exports = config;
