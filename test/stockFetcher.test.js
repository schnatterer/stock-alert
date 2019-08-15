const nock = require('nock');

const StockFetcher = require('../src/stockFetcher');

let parserMock;
const baseUrl = 'http://mo.ck/';

beforeEach(() => {

    parserMock = {
        createUrl: id => baseUrl + id,
        parse: text => text.replace('parseMe', '')
    };

    nock.cleanAll();

    nock(baseUrl)
        .get('/stockName')
        .reply(200, 'parseMe 42,23USD ');
});

describe('Fetching', () => {

    test('succeeds', async () => {

        const price = await StockFetcher.fetch('stockName', parserMock);
        expect(price).toEqual(42.23)
    });

    test('fails when fetch throws', () => {

        nock.cleanAll();
        nock(baseUrl)
            .get('/stockName')
            .replyWithError('fetch exception');

        expect.assertions(1);

        return expect(StockFetcher.fetch('stockName', parserMock))
            .rejects.toThrow('fetch exception');
    });

    test('fails when return code non successful', () => {

        nock.cleanAll();
        nock(baseUrl)
            .get('/stockName')
            .reply(404, 'not found');

        expect.assertions(1);

        return expect(StockFetcher.fetch('stockName', parserMock))
            .rejects.toEqual('response not OK. Status: 404');
    });

    test('fails parser returns undefined', () => {

        parserMock.parse = text => undefined;
        expect.assertions(1);

        return expect(StockFetcher.fetch('stockName', parserMock))
            .rejects.toEqual('price not found on website');
    });

    test('fails parser returns not a number', () => {

        parserMock.parse = text => "this ain't no number";
        expect.assertions(1);

        return expect(StockFetcher.fetch('stockName', parserMock))
            .rejects.toEqual("error parsing numeric price: this ain't no number");
    });
});
