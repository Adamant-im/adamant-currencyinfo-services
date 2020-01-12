const request = require('request');
const config = require('./configReader');
const log = require('./log');
const api = require('../modules/api');

module.exports = (message, type) => {
	try {
		log[type](message.replace(/\*/g, '').replace(/_/g, ''));

		if (!config.slack && !config.adamant_notify) {
			return;
		}

		let color;
		switch (type) {
		case ('error'):
			color = '#FF0000';
			break;

		case ('warn'):
			color = '#FFFF00';
			break;

		case ('info'):
			color = '#00FF00';
			break;
		case ('log'):
			color = '#ffffff';
			break;
		}
		const opts = {
			uri: config.slack,
			method: 'POST',
			json: true,
			body: {
				'attachments': [{
					'fallback': message,
					'color': color,
					'text': message,
					'mrkdwn_in': ['text']
				}]
			}
		};
		if (config.slack && config.slack.length > 5) {
			request(opts);
		}
		if (config.adamant_notify && config.adamant_notify.length > 5 && config.adamant_notify.startsWith('U') && config.passPhrase && config.passPhrase.length > 30) {
			api.send(config.passPhrase, config.adamant_notify, `${type}| ${message.replace(/\*/g, '**')}`, 'message');
		}
	} catch (e) {
		log.error('Notifier error: ' + e);
	}
};
