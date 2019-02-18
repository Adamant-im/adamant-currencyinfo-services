# adamant-currencyinfo-services is a crypto and fiat currency quotes storage service.

## Installation
### Requirements
* Ubuntu 16 / Ubuntu 18 (other OS had not been tested)
* NodeJS v 8+ (already installed if you have a node on your machine)

## Setup
```
git clone https://github.com/Adamant-im/adamant-currencyinfo-services
cd ./adamant-currencyinfo-services
npm i
```

## Pre-launch tuning
```
nano config.json
```

Parameters:
* `crypto` <array> List of Coins for each of which tickers will be collected together with **baseCoins**
* `baseCoins` <array> List of base coins for each of which tickers will be collected together with **crypto**
* `fiat` <object> List of fiat pairs and their codes MOEX api
* `cmcApiKey` <object> api key coinmarketcap.com api
* `port` <number> Port for connecting the api server. The api is available at http://IP:port
* `refreshInterval` <number> Refresh rate MOEX and coinmarketcap api
