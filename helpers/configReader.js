const jsonminify = require('jsonminify');
const fs = require('fs');
const log = require('./log');
const isDev = process.argv.includes('dev');
let config = {};

try {
	if (isDev) {
		config = JSON.parse(jsonminify(fs.readFileSync('./config.test', 'utf-8')));
	} else {
		config = JSON.parse(jsonminify(fs.readFileSync('./config.json', 'utf-8')));
	}
} catch (e) {
	log.error('Error reading config: ' + e);
}

config.isDev = isDev;
config.crypto_all = config.crypto_cmc.concat(config.crypto_cc); // Coingecko will be added in getCg module

module.exports = config;
