const StockFetcher = require("./stockFetcher.js");
const moment = require('moment');
const Alert = require("./alert.js");

class Alerts {

    constructor(config, prices) {
        this.prices = prices;
        this.config = config;
        // Store "today" at construction to make sure all stocks have the same day during one execution
        this.todayMoment = moment().utc();
    }

    evaluate() {
        let promises = [];

        Object.keys(this.config.stocks).forEach(stockName => {
            promises.push(this.fetchValueAndEvaluateAlerts(stockName, this.config.stocks[stockName].source))
        });

        return Promise.all(promises)
            .finally(() => this.prices.save());
    }

    fetchValueAndEvaluateAlerts(stockName, source) {
        return StockFetcher.fetch(stockName, require(`./parsers/${source}Parser`))
            .then(priceValue => {

                this.prices.update(priceValue, stockName, this.todayMoment.clone());

                return this.evaluateAlerts(stockName);
            }).catch(err => {
                console.log(err);
                return [`Warning: Evaluating alerts failed for ${stockName}: ${err}`];
            });
    }

    evaluateAlerts(stockName) {
        let triggeredAlerts = [];
        let alerts = this.config.stocks[stockName].alerts;

        if (alerts) {
            alerts.forEach(alert => {
                const triggeredAlert = Alert.evaluate(alert, this.prices.get(stockName), this.todayMoment.clone());
                if (triggeredAlert) {
                    triggeredAlerts.push(`${stockName}: ${triggeredAlert}`)
                }
            });
        }
        return triggeredAlerts;
    }
}

module.exports = Alerts;