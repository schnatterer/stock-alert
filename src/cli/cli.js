const Config = require("../config");
const Prices = require("../prices");
const Alerts = require("../alerts");

function cli() {
    return evaluateAlerts()
        .then(totalAlerts => {
            return process.exit(totalAlerts);
        }).catch(err => {
            console.error(err);
            process.exit(1);
        });
}

function evaluateAlerts() {

    return new Alerts(Config.load(), new Prices()).evaluate()
        .then(alertsPerStock => {
            return countAndPrintAlerts(alertsPerStock);
        })
}

function countAndPrintAlerts(alertsPerStock) {

    let totalAlerts = 0;

    alertsPerStock.forEach(alerts => {
        alerts.forEach(alert => {
            console.error(alert);
            totalAlerts++
        })
    });

    return totalAlerts;
}

module.exports = cli;