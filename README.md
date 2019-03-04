ADAMANT InfoServices is a crypto and fiat currency rates service provider. It collects rates from MOEX and Coinmarketcap, calculates cross-rates, and provides information via API.

# Installation
## Requirements
* Ubuntu 16 / Ubuntu 18 (other OS had not been tested)
* NodeJS v 8+ (already installed if you have a node on your machine)
* MongoDB ([installation instructions](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/))

## Setup
```
su - adamant
git clone https://github.com/Adamant-im/adamant-currencyinfo-services
cd ./adamant-currencyinfo-services
npm i
```

## Pre-launch tuning
```
nano config.json
```

Parameters:
* `crypto` <array> List of coins to fetch rates from Coincarketcap
* `fiat` <object> List of fiat pairs and their codes to fetch from MOEX
* `baseCoins` <array> List of coins to calculate all available pairs using `crypto` and `fiat`
* `cmcApiKey` <string> Coinmarketcap API key. You must get yours at https://coinmarketcap.com/api/.
* `port` <number> Port for providing InfoServices Rates API. It will be available at http://IP:port.
* `refreshInterval` <number> Refresh rate in minutes to fetch data from MOEX and Coinmarketcap. Note: often requests can lead to blocking of your API keys.
```
```
  
## Launching
You can start ADAMANT InfoServices with `node app` command, but it is recommended to use process manager:
```
pm2 start --name info-service app.js 
```

## Add info-service to cron:
```
crontab -e
```

Add string:
```
@reboot cd /home/adamant/adamant-currencyinfo-services && pm2 start --name info-service app.js
```

# Usage

To test InfoServices successfully installed, try to open link
http://IP:36668/get?coin=ADM in web browser.

For usage see [InfoServices API documentation](https://github.com/Adamant-im/adamant-currencyinfo-services/wiki/InfoServices-API-documentation).
