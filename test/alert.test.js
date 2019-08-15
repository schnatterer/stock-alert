const Alert = require('../src/alert');
const moment = require('moment');

let momentForTest;
const prices = {
    "2014-08-11": {
        "value": 90.01
    },
    "2019-07-14": {
        "value": 95.01
    },
    "2019-08-08": {
        "value": 200.01
    },
    "2019-08-11": {
        "value": 100.01
    }
};
const alertDay = {
    value: '-3%',
    valuePercent: -3,
    within: "3 days",
    withinAmount: 3,
    withinUnit: "days"

};
const alertWeek = {
    value: '5%',
    valuePercent: 5,
    within: "4 weeks",
    withinAmount: 4,
    withinUnit: "weeks"

};
const alertYear = {
    value: '10%',
    valuePercent: 10,
    within: "5 years",
    withinAmount: 5,
    withinUnit: "years"
};

beforeEach(() => {
    momentForTest = moment("2019-08-11 11:23:52");
});

describe('alerts', () => {

    test('for negative percentage (day)', () => {
        const expectedAlert = Alert.evaluate(alertDay, prices, momentForTest);
        expect(expectedAlert).toEqual(
            "Alert: Price change within 3 days: -50.00%. (Price today: 100.01; Compared with: 200.01)"
        );
    });

    test('for positive percentage (week)', () => {
        const expectedAlert = Alert.evaluate(alertWeek, prices, momentForTest);
        expect(expectedAlert).toEqual(
            "Alert: Price change within 4 weeks: 5.26%. (Price today: 100.01; Compared with: 95.01)"
        );
    });

    test('for years', () => {
        const expectedAlert = Alert.evaluate(alertYear, prices, momentForTest);
        expect(expectedAlert).toEqual(
            "Alert: Price change within 5 years: 11.11%. (Price today: 100.01; Compared with: 90.01)"
        );
    });

});

describe('Does not alert', () => {
    test('for missing value for comparison - returns alert ', () => {
        const expectedAlert = Alert.evaluate( {
            value: '10%',
            valuePercent: 10,
            within: "100 years",
            withinAmount: 100,
            withinUnit: "years"
        }, prices, momentForTest);
        expect(expectedAlert).toEqual(
            "Warning: No price stored for date 1919-08-11. Can't evaluate alert.within 100 years."
        );
    });

    test('if alert not triggered - returns undefined ', () => {
        const expectedAlert = Alert.evaluate({
            value: '-6%',
            valuePercent: -6,
            within: "4 weeks",
            withinAmount: 4,
            withinUnit: "weeks"

        }, prices, momentForTest);
        expect(expectedAlert).toBeUndefined();
    });

});
