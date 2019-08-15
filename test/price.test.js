jest.mock('fs', () => require('memfs').fs);
const moment = require('moment');

const Prices = require('../src/prices');

const path = require('path');
const vol = require('memfs').vol;

let prices;

const storedPrices = '{' +
    '"some/stock":{' +
        '"2019-07-30":{"value":10.36,"timestamp":"2019-07-31T12:41:40.153Z"},' +
        '"2019-08-06":{"value":8.36,"timestamp":"2019-08-05T12:41:40.153Z"}' +
    '}}';

beforeEach(() => {
    vol.reset();
    vol.mkdirpSync(path.resolve(process.cwd()));
    vol.writeFileSync('prices.json', storedPrices, {encoding: 'utf8'});

     prices = new Prices();
});

describe('Loading prices from file', () => {

    test('returns content of a file as json', () => {

        expect(prices.prices).toEqual(JSON.parse(storedPrices))
    });

    test('returns empty object if no file present', () => {
        vol.reset();

        prices = new Prices();
        expect(prices.prices).toEqual({})
    });
});

describe('Saving prices to file', () => {

    test('succeeds', () => {

        prices.update(42.0, 'another stock', moment("2019-08-11 11:23:52"));
        prices.save();

        expect(prices.prices).toEqual(JSON.parse(vol.readFileSync('prices.json', 'utf8')))
    });
});

describe('Reading a price', () => {

    test('existing price', () => {
        expect(Object.keys(
            prices.get('some/stock')).length)
            .toEqual(2)
    });

    test('non existing price', () => {
        expect(prices.get('missing')).toBeUndefined()
    });

});

describe('Writing a price', () => {

    test('new Stock', () => {

        const priceMoment = moment("2019-08-11 11:23:52");
        prices.update(42.0, 'another stock', priceMoment);
        let newPrice = prices.get('another stock')['2019-08-11'];
        expect(newPrice.value).toEqual(42.0);
        expect(newPrice.timestamp).toEqual(priceMoment.format());
    });

    test('existing price', () => {
        const priceMoment = moment("2019-08-06 11:23:52");
        prices.update(42.0, 'some/stock', priceMoment);
        let newPrice = prices.get('some/stock')['2019-08-06'];
        expect(newPrice.value).toEqual(42.0);
        expect(newPrice.timestamp).toEqual(priceMoment.format());
    });

});