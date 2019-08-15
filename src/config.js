const fs = require('fs');

const fileName = "config.json";

class Config {

    static load() {

        if (!fs.existsSync(fileName)) {
            throw `No config file found at ${fileName}.`;
        }

        const rawConfig = JSON.parse(fs.readFileSync(fileName, 'utf8'));
        return Config.parseConfig(rawConfig);
    }

    /**
     * Updates all "alerts" to be easier processed by machines.
     * The "within" value is split up into to fields compatible with moment.js and the value is split up into
     * numerical fields.
     *
     * from e.g.
     * { value: "-3%",
     *   within: "1 day" }
     * to be easi
     * { value: "-3%",
     * { valuePercent: -3,
     *   within: "1 day"
     *   withinAmount: 1
     *   withinUnit: "days"   }
     */
    static parseConfig(rawConfig)  {
        if (!rawConfig.stocks) {
            throw "Unexpected config.json. Missing 'stocks' object";
        }
        Object.keys(rawConfig.stocks).forEach(stockName => {
            const alerts = rawConfig.stocks[stockName].alerts;
            if (alerts) {
                Config.parseAlerts(alerts);
            }
        });
        return rawConfig
    }
    static parseAlerts(alerts)  {
        alerts.forEach(alert => {
            alert.valuePercent = Config.parseAlertValueToNumber(alert.value);
            alert.withinAmount = Config.findAmountOfAlertWithin(alert.within);
            alert.withinUnit = Config.findMomentUnitOfAlertWithin(alert.within);
        });
    }

    static parseAlertValueToNumber(value) {
        return parseFloat(value
            .replace('%', '')
            .replace(' ', ''));
    }

    static findUnitOfAlertWithin(within) {
        return within
            .replace(Config.findAmountOfAlertWithin(within), '')
            .replace(' ', '');
    }

    static findAmountOfAlertWithin(within) {
        return parseInt(within.replace(/[^0-9.,]+/g, ""));
    }


    static findMomentUnitOfAlertWithin(within) {
        let withinUnit = Config.findUnitOfAlertWithin(within);
        let momentUnit;

        if (withinUnit === 'days' || withinUnit === 'day') {
            momentUnit = 'days'
        } else if (withinUnit === 'weeks' || withinUnit === 'week') {
            momentUnit = 'weeks'
        } else if (withinUnit === 'years' || withinUnit === 'year') {
            momentUnit = 'years'
        } else {
            throw `Warning: Unknown alert.within: ${within}. Supports only day, week, year. Each in singular or plural.`
        }

        return momentUnit;
    }
}

module.exports = Config;