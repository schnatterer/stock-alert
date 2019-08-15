const Alerts = require('../src/alerts');

const Alert = require('../src/alert');
const StockFetcher = require('../src/stockFetcher');

const moment = require('moment');

jest.mock('../src/alert');
jest.mock('../src/stockFetcher');

let config;
let prices;
let alerts;
let fetchedPrices;

beforeEach(() => {
    jest.spyOn(Date, 'now').mockImplementation(() => 0);
    fetchedPrices = {
        a: '42',
        b: '23'
    };
    StockFetcher.fetch.mockImplementation((stockName, parser) => {
        expect(parser.name).toBe('OnvistaParser');
        return Promise.resolve(fetchedPrices[stockName])
    });
    config = {
        stocks: {
            a: {
                source: 'onvista',
                alerts: ['a1']
            },
            b: {
                source: 'onvista',
                alerts: ['b1', 'b2']
            },
        }
    };
    prices = {
        get: jest.fn(),
        update: jest.fn(),
        save: jest.fn()
    };
    alerts = new Alerts(config, prices);
    Alert.evaluate.mockImplementation((alert, price, todayMoment) => alert);
});

describe('Alerts', () => {

    test('Returns one array per stock, even when no alerts', async () => {
        config.stocks.a.alerts = undefined;
        config.stocks.b.alerts = undefined;

        const triggeredAlerts = await alerts.evaluate();

        expect(triggeredAlerts).toEqual([[], []]);

        verifyPricesCalled();
    });

    test('Returns one array per stock', async () => {
        const triggeredAlerts = await alerts.evaluate();

        expect(triggeredAlerts).toEqual([
            ['a: a1'],
            ['b: b1', 'b: b2']
        ]);
        verifyPricesCalled();
    });

    test('Failing price update/eval returns a warning', async () => {
        prices.update.mockImplementation( (priceValue, stockName, mom) => {
            if (stockName === 'b') throw 'mocked failed update'
        });

        const triggeredAlerts = await alerts.evaluate();

        expect(triggeredAlerts).toEqual([
            ['a: a1'],
            ['Warning: Evaluating alerts failed for b: mocked failed update']
        ]);
        expect(prices.update.mock.calls.length).toBe(2);
        expect(prices.save.mock.calls.length).toEqual(1);
    });

    test('Failing fetch returns a warn', async () => {
        StockFetcher.fetch.mockImplementation((stockName, parser) => {
            if (stockName === 'a') {
                return Promise.reject('mocked failed fetch')
            }
            return Promise.resolve(fetchedPrices[stockName])
        });

        const triggeredAlerts = await alerts.evaluate();

        expect(triggeredAlerts).toEqual([
            ['Warning: Evaluating alerts failed for a: mocked failed fetch'],
            ['b: b1', 'b: b2']
        ]);
        expect(prices.update.mock.calls.length).toBe(1);
        expect(prices.save.mock.calls.length).toEqual(1);
    });

    // TODO
    // test parser loading
    // make sure todayMoment is always passed as copy() because moment is mutable
});

function verifyPricesCalled() {
    expect(prices.update.mock.calls[0][0]).toEqual('42');
    expect(prices.update.mock.calls[0][1]).toEqual('a');
    expect(prices.update.mock.calls[0][2].format()).toEqual(moment(new Date(0)).utc().format());

    expect(prices.update.mock.calls[1][0]).toEqual('23');
    expect(prices.update.mock.calls[1][1]).toEqual('b');
    expect(prices.update.mock.calls[1][2].format()).toEqual(moment(new Date(0)).utc().format());
    expect(prices.update.mock.calls.length).toBe(2);

    expect(prices.save.mock.calls.length).toEqual(1);
}
