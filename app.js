const currencys = {};
const Moex = require('./helpers/getMoex');
const Cmc = require('./helpers/getCmc');
const router = require('./modules/router');
const db = require('./db/mongodb');
router(currencys);

function refresh() {
    console.log('------------ Update -------------');
    Moex(data => {
        if (data) Object.assign(currencys, data)
    });

    ['USD', 'RUB', 'EUR', 'CNY', 'JPY', 'BTC', 'ETH'].forEach(b => {
        Cmc(b, data => {
            if (data) Object.assign(currencys, data);
        });
    });

    setTimeout(() => {
        db.save(currencys, (res) => {
            if (res)
                console.log('Success saved currencys');
            else
                console.log('Error saved currencys');
        });
    }, 10000);
}

refresh();

setInterval(refresh, 600 * 1000);