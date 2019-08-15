class Alert {

    static evaluate(alert, prices, todayMoment) {
        let priceToday = prices[todayMoment.format('YYYY-MM-DD')];
        let otherPrice = this.findOtherPrice(alert, prices, todayMoment);

        if (!otherPrice.value) {
            return otherPrice
        }

        let changeAbsolute = priceToday.value - otherPrice.value;
        let changePercent = changeAbsolute / otherPrice.value * 100;

        let changeAlarm = alert.valuePercent;
        if (alert.value.startsWith('-')) {
            if (changePercent <= changeAlarm) {
                return Alert.textualAlert(alert, changePercent, priceToday, otherPrice)
            }
        } else {
            if (changePercent >= changeAlarm) {
                return Alert.textualAlert(alert, changePercent, priceToday, otherPrice)
            }
        }
    }

    static textualAlert(alert, changePercent, priceToday, otherPrice) {
        return `Alert: Price change within ${alert.within}: ${Alert.keepOnlyTwoDigitsAfterDecimalPoint(changePercent)}%. ` +
            `(Price today: ${priceToday.value}; Compared with: ${otherPrice.value})`;
    }

    static findOtherPrice(alert, prices, todayMoment) {

        let date = todayMoment.subtract(alert.withinAmount, alert.withinUnit).format('YYYY-MM-DD');
        let price = prices[date];

        if (!price) {
            return `Warning: No price stored for date ${date}. Can't evaluate alert.within ${alert.within}.`
        }

        return price;
    }

    static keepOnlyTwoDigitsAfterDecimalPoint(number) {
       return number.toFixed(2);
    }
}

module.exports = Alert;