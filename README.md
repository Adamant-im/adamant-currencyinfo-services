# Deprecated and replaced with Currencyinfo

We replaced InfoServices with [Currencyinfo](https://github.com/Adamant-im/currencyinfo/), a powerful, self-hosted, and built-from-scratch crypto and fiat currency rates service provider.

# Legacy description

ADAMANT InfoServices is a crypto and fiat currency rates service provider. It collects rates from MOEX, Currency-Api, ExchangeRate, Coinmarketcap, CryptoCompare and Coingecko and calculates cross-rates, and provides information via API.

It is own-hosted service run on your server, it stores all rates in local database, updated with `refreshInterval` frequency.

Features:

- Collects rates from MOEX for fiat tickers
- Collects rates from Currency-Api for fiat tickers
- Collects rates from ExchangeRate (Currency-Api2) for fiat tickers
- Collects rates from Coinmarketcap for crypto tickers
- Collects rates from CryptoCompare for crypto tickers
- Collects rates from Coingecko for crypto tickers
- Own-hosted service
- Reliable: uses different sources for one coin, and notifies about significant deviation
- Minimum API calls. Free API keys fit.
- Notifications in case of errors to Slack
- Stores history on server, no need to make additional request
- Easy setup, settings are in a config file
- Provides [RESTful API](https://github.com/Adamant-im/adamant-currencyinfo-services/wiki/InfoServices-API-documentation)
- It is fast; low hardware requirements
- Open source
- Free to use for any purposes

# Installation

## Requirements

- Ubuntu 18+ (we didn't test with others)
- NodeJS v16+
- MongoDB ([installation instructions](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/))

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

- `crypto_cmc` <array> List of coins to fetch rates from Coinmarketcap
- `crypto_cmc_coinids` <object> List of Coinmarketcap Symbol-Id pairs like { "ADM": 3703 } to fetch rates from Coinmarketcap. Used when one coin symbol is used for different coins. Coin ids can be seen via /cryptocurrency/quotes/latest?slug=coinname request.
- `crypto_cc` <array> List of coins to fetch rates from Cryptocompare
- `crypto_cg` <array> List of coins to fetch rates from Coingecko. Better use `crypto_cg_coinids`.
- `crypto_cg_coinids` <string, array> List of Coingecko coin Ids to fetch rates from Coingecko. Used when one coin symbol is used for different coins. Coin ids can be seen on https://api.coingecko.com/api/v3/coins/list.
- `fiat` <object> List of fiat pairs and their codes to fetch from MOEX
- `baseCoins` <array> List of coins to calculate all available pairs using `crypto` and `fiat`
- `cmcApiKey` <string> Coinmarketcap API key. You must get yours at https://coinmarketcap.com/api/.
- `ccApiKey` <string> Cryptocompare API key. You must get yours at https://min-api.cryptocompare.com/.
- `cgApiKey` <string> No need for Coingecko API key. Leave it default.
- `port` <number> Port for providing InfoServices Rates API. It will be available at http://IP:port.
- `refreshInterval` <number> Refresh rate in minutes to fetch data from data sources. Note: often requests can lead to blocking of your API keys.
- `slack` <string> Token for Slack alerts for InfoService administrator. No alerts if not set.
- `adamant_notify` <string> ADM address to receive alerts for InfoService administrator. Recommended.
- `passPhrase` <string> The secret phrase for account you want to send alerts from. Obligatory in case of you set `adamant_notify`
- `node_ADM` <string, array> List of nodes for API work, obligatorily in case of you set `adamant_notify`
- `log_level` <string> The software will use verbosity according to `log_level`. It can be `none` < `error` < `warn` < `info` < `log`.

## Launching

You can start ADAMANT InfoServices with `node app` command, but it is recommended to use process manager:

```
pm2 start --name info-service app.js
```

## Add info-service to cron

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
