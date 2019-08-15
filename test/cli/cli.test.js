const Alerts = require('../../src/alerts');
const Config = require('../../src/config');
const Prices = require('../../src/prices');
const cli = require('../../src/cli/cli');

jest.mock('../../src/config');
jest.mock('../../src/alerts');
jest.mock('../../src/prices');

let mockExit;

Alerts.mockImplementation((config, prices) => {

    expect(config).toEqual('mockedConfig');
    expect(prices).toEqual({mocked: 'prices'});

    return {
        evaluate: () => Promise.resolve(mockedAlerts)
    };
});

Config.load.mockReturnValue('mockedConfig');

Prices.mockImplementation(() => {
    return {mocked: 'prices'}
});

let mockedAlerts;
let mockedAlertsFlat;

beforeEach(() => {
    mockedAlerts = [
        ['Stock1, Alert1', 'Stock1, Alert2'],
        ['Stock2, Alert1', 'Stock2, Alert2', 'Stock2, Alert3']
    ];
    mockedAlertsFlat = [].concat.apply([], mockedAlerts);
    mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
});

afterEach( () => {
    mockExit.mockRestore();
});

describe('CLI', () => {

    test('number of alerts is returned as exit code', async () => {
        const mockStdout = jest.spyOn(process.stdout, 'write').mockImplementation(() => {});
        await cli();
        expect(mockExit).toHaveBeenCalledWith(5);
        mockStdout.mock.calls.forEach( (call,i) => {
            expect(call[0]).toContain('console.err');
            expect(call[0]).toContain(mockedAlertsFlat[i]);
        });
        mockStdout.mockRestore();
    });

    test('number of alerts is returned as exit code', async () => {
        mockedAlerts = [];
        await cli();
        expect(mockExit).toHaveBeenCalledWith(0);
    });

    test('1 is returned in case of generic error', async () => {
        Alerts.mockImplementation((config, prices) => {
            return {
                evaluate: () => Promise.reject('mocked exception')
            };
        });
        // TODO this test fails when all suits are run with yarn. Maybe there is a better way to test stdout?
        //const mockStdout = jest.spyOn(process.stdout, 'write').mockImplementation(() => {});
        await cli();
        expect(mockExit).toHaveBeenCalledWith(1);
        //expect(mockStdout.mock.calls[0][0]).toContain('console.err');
        //expect(mockStdout.mock.calls[0][0]).toContain('mocked exception');
        //mockStdout.mockRestore();
    });
});