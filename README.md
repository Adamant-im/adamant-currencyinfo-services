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

## Install MongoDB
### Step 1: Import the MongoDB repository
Import the public key used by the package management system.
The Ubuntu package management tools ensure package consistency and authenticity by verifying that they are signed with GPG keys. The following command will import the MongoDB public GPG key.
```
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
```
Create a source list file for MongoDB
Create the /etc/apt/sources.list.d/mongodb-org-3.4.list list file using the command below.
```
echo "deb http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.4.list
```
Update the local package repository
```
sudo apt-get update
```
### Step 2: Install the MongoDB packages
Install the latest stable version of MongoDB:
```
sudo apt-get install -y mongodb-org
```
### Step 3: Launch MongoDB as a service on Ubuntu 16.04
Enable auto start MongoDB when system starts.
```
sudo systemctl enable mongodb
```


## Launching
You can start the info-service with the `node app` command, but it is recommended to use the process manager for this purpose.
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

