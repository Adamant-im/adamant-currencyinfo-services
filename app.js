const currencys = {};
const Moex = require('./helpers/getMoex');
const Cmc = require('./helpers/getCmc');
const _ = require('underscore');
const router = require('./modules/router');
const {
	refreshInterval,
	baseCoins,
	crypto
} = require('./config.json');

const db = require('./db/mongodb');

router(currencys);

function refresh() {
	console.log('------------ Update -------------');
	Moex(data => {
		if (data)
		Object.assign(currencys, data);
		
		Cmc('USD', data => {
			if (data)
			Object.assign(currencys, data);
			
			converter(currencys);
			console.log(currencys);
			
			db.save(currencys, (res) => {
				if (res)
				console.log('Success saved currencys');
				else
				console.log('Error saved currencys');
			});
		});
	});
}

refresh();

setInterval(refresh, refreshInterval*60000);

function converter(currencys) {
	baseCoins.forEach(b => {
		const price = currencys['USD/'+b] || 1/currencys[b+'/USD'];
		if(!price) return;
		crypto.forEach(c=>{
			const priceAlt = 1/currencys[c+'/USD'];
			currencys[c+'/'+b]=+(price/priceAlt).toFixed(8);
		});
	});
}

