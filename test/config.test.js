jest.mock('fs', () => require('memfs').fs);

const Config = require('../src/config');

const path = require('path');
const vol = require('memfs').vol;

const someConfig = '{' +
    '"stocks": { "b" : "c" },' +
    '"d": "true"' +
    '}';

const configWithAlerts = '{' +
    '  "stocks": {' +
    '    "aktien/Disney-Aktie-US2546871060": {' +
    '      "source": "onvista"' +
    '    },' +
    '    "etf/ISHARES-S-P-500-INFORMATION-TECHNOLOGY-SECTOR-UCIS-ETF-USD-ACC-ETF-IE00B3WJKG14": {' +
    '      "source": "onvista",' +
    '      "alerts": [' +
    '        {' +
    '          "value": "-2.4%",' +
    '          "within": "3 days"' +
    '        },' +
    '        {' +
    '          "value": "5%",' +
    '          "within": "1 week"' +
    '        }' +
    '      ]' +
    '    }' +
    '  }' +
    '}';

beforeEach(() => {
    vol.reset();
    vol.mkdirpSync(path.resolve(process.cwd()));
});

describe('Loading config from file', () => {

    beforeEach(() => {
        vol.writeFileSync('config.json', someConfig, {encoding: 'utf8'});
    });
    
    test('returns content of a file as json', () => {

        expect(Config.load()).toEqual(JSON.parse(someConfig))
    });

    test('fails if no file present', () => {
        vol.reset();

        expect(() => {
            Config.load()
        }).toThrow('No config file found at config.json');
    });

    test('fails file does not contain "stocks"', () => {
        vol.reset();
        vol.mkdirpSync(path.resolve(process.cwd()));
        vol.writeFileSync('config.json', someConfig.replace('stocks', 'socks'), {encoding: 'utf8'});

        expect(() => {
            Config.load()
        }).toThrow("Unexpected config.json. Missing 'stocks' object");
    });
});

describe('Parsing alarms', () => {

    test('does not change raw config when no alerts', () => {
        vol.writeFileSync('config.json', someConfig, {encoding: 'utf8'});
        expect(Config.load()).toEqual(JSON.parse(someConfig))
    });
    
    test('enriches alerts', () => {
        vol.writeFileSync('config.json', configWithAlerts, {encoding: 'utf8'});
        const config = Config.load();
        const alerts = config.stocks['etf/ISHARES-S-P-500-INFORMATION-TECHNOLOGY-SECTOR-UCIS-ETF-USD-ACC-ETF-IE00B3WJKG14'].alerts
        expect(alerts[0].valuePercent).toEqual(-2.4);
        expect(alerts[0].withinAmount).toEqual(3);
        expect(alerts[0].withinUnit).toEqual("days");

        expect(alerts[1].valuePercent).toEqual(5);
        expect(alerts[1].withinAmount).toEqual(1);
        expect(alerts[1].withinUnit).toEqual("weeks");
    });

    test('fails when within unit is not an int', () => {
        vol.writeFileSync('config.json', configWithAlerts.replace('1 week', '1.2 week'), {encoding: 'utf8'});
        expect(() => {
            Config.load()
        }).toThrow('Warning: Unknown alert.within: 1.2 week. Supports only day, week, year. Each in singular or plural.')
    });
});