const htmlparser2 = require("htmlparser2");

// TODO README: Find Symbols via https://finance.yahoo.com/lookup
const baseUrl = 'https://mobile-query.finance.yahoo.com/v6/finance/quote?symbols';

class YahooParser {

    static createUrl(id) {
        return `${baseUrl}=${id}`;
    }

    static parse(text) {

        // TODO validate and exception handling
        const json = JSON.parse(text);
        const resultArray = json.quoteResponse.result;
        //if (resultArray.length != 1) {

        // TODO move number parsing to ParserUtils and make stockFetcher expect a number
        return resultArray[0].regularMarketPrice.toString()
    }
}

module.exports = YahooParser;