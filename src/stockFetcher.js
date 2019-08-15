const fetch = require('node-fetch');

class StockFetcher {

    static fetch(stockName, parser) {

        const url = parser.createUrl(stockName);
        console.log(`Trying to fetch url ${url}`);

        return fetch(url)
            .then(res => StockFetcher.validatedToText(res))
            .then(text => {

                let price = parser.parse(text);
                return StockFetcher.parsedPriceToNumber(price);
            });
    }

    static parsedPriceToNumber(price) {
        if (!price) {
            throw "price not found on website"
        }
        let number = parseFloat(StockFetcher.removeSpaces(StockFetcher.replaceDecimalSeparator(StockFetcher.removeCurrency(price))));
        if (isNaN(number)) {
            throw `error parsing numeric price: ${price}`
        }
        return number
    }

    static removeCurrency(price) {
        return price.replace(/[^0-9,.]+/g, "");
    }

    static replaceDecimalSeparator(str) {
        return str.replace(',', '.')
    }

    static removeSpaces(str) {
        return str.replace(' ', '')
    }

    static validatedToText(res) {
        if (res.ok) {
            return res.text()
        } else {
            throw `response not OK. Status: ${res.status}`;
        }
    }
}

module.exports = StockFetcher;