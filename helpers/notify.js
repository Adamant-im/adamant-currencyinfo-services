const axios = require('axios');
const config = require('./configReader');
const log = require('./log');
const {
  slack,
} = config;

module.exports = (message, type, silent_mode = false) => {
  try {
    if (!silent_mode) {
      log[type](removeMarkdown(message));

      if (slack && slack.length) {
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
            color = '#FFFFFF';
            break;
        }

        const params = {
          'attachments': [{
            'fallback': message,
            'color': color,
            'text': makeBoldForSlack(message),
            'mrkdwn_in': ['text'],
          }],
        };

        slack.forEach((slackApp) => {
          if (typeof slackApp === 'string' && slackApp.length > 34) {
            axios.post(slackApp, params)
                .catch(function(error) {
                  log.log(`Request to Slack with message ${message} failed. ${error}.`);
                });
          }
        });
      }

    }

  } catch (e) {
    log.error('Notifier error: ' + e);
  }

};

function removeMarkdown(text) {
  return doubleAsterisksToSingle(text).replace(/([_*]\b|\b[_*])/g, '');
}

function doubleAsterisksToSingle(text) {
  return text.replace(/(\*\*\b|\b\*\*)/g, '*');
}

function singleAsteriskToDouble(text) {
  return text.replace(/(\*\b|\b\*)/g, '**');
}

function makeBoldForMarkdown(text) {
  return singleAsteriskToDouble(doubleAsterisksToSingle(text));
}

function makeBoldForSlack(text) {
  return doubleAsterisksToSingle(text);
}
