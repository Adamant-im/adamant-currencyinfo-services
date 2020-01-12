const log = require('../helpers/log');
const config = require('../helpers/configReader');
module.exports = require('adamant-api')({passPhrase: config.passPhrase, node: config.node_ADM}, log);
