const fs = require('fs');

const fileName = "prices.json";

class Prices {

    constructor() {

        if (!fs.existsSync(fileName)) {
            console.log(`No price history found at ${fileName}.`);
            this.prices = {}
        } else {
            this.prices = JSON.parse(fs.readFileSync(fileName, 'utf8'));
        }
    }

    get(stockName) {
        return this.prices[stockName];
    }

    update(priceValue, stockName, moment) {
        let pricesOfStock = this.prices[stockName] || {};
        pricesOfStock[moment.format('YYYY-MM-DD')] = {
            value: priceValue,
            timestamp: moment.format()
        };
        this.prices[stockName] = pricesOfStock;
    }

    save() {
        console.log(`Updating prices file ${fileName}`);
        fs.writeFileSync(fileName, JSON.stringify(this.prices))
    }
}

module.exports = Prices;