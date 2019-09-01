stock-alert
=====

[![Build Status](https://travis-ci.org/schnatterer/stock-alert.svg?branch=master)](https://travis-ci.org/schnatterer/stock-alert)
[![schnatterer/stock-alert@docker hub](https://images.microbadger.com/badges/image/schnatterer/stock-alert.svg)](https://hub.docker.com/r/schnatterer/stock-alert)
[![QGate](https://sonarcloud.io/api/project_badges/measure?project=info.schnatterer.stock-alert&metric=alert_status)](https://sonarcloud.io/dashboard?id=info.schnatterer.stock-alert)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=info.schnatterer.stock-alert&metric=coverage)](https://sonarcloud.io/dashboard?id=info.schnatterer.stock-alert)
[![TecDebt](https://sonarcloud.io/api/project_badges/measure?project=info.schnatterer.stock-alert&metric=sqale_index)](https://sonarcloud.io/dashboard?id=info.schnatterer.stock-alert)

Command line app that fetches stock prices, compares them to defined references and triggers alert if necessary.

# How to use

* Run this app e.g. once per day to fetch prices,
* it will create its own price database,
* that allows for comparing stock prices to past ones.
* For example: "If the price of stock A is less than 5% of its value of yesterday trigger an alarm"
* Alarms will be printed to stderr and also result in a non-zero return code.
* This way you could embed this app in some infrastructure that sends emails containing stderr on failed jobs.

Note: 
* The app can scrape or parses prices from websites or APIs, via an extensible parser mechanism. You can add
your own favorite website via a parser (see bellow).
* If want less output (only the alerts), just skip stdout by appending `> /dev/null` to your command.


## Docker

Using the docker image is most convenient. It brings its own nodejs installation an does not need to be downloaded
explicitly.

```bash
docker run -v $(pwd)/example:/workdir schnatterer/stock-alert
```
## Node.js

You can also run it with a local node js instance. 

```bash
yarn install
cd example
node ../src/cli/main.js
```

## Config

All configuration is done via `config.json` that is read from the working directory.
See [example/config.json](example/config.json)

## Price database

The stock prices are read from and written to a `prices.json` in the working directory.

# Add own parsers

There is [one exemplary parser implementation](src/parsers/onvistaParser.js) (including a [test](test/parsers/onvistaParser.test.js))
 but you can easily extend this for your favorit stock website:

* Just provide an `<name>parser.json` in the `src/parsers` folder that scrapes/parses the price of your stock from a URL.
* In `config.json`: set the `source` of a stock to `<name>`.

Example (let's set `<name>` to `paul`):

```bash
docker run -v $(pwd)/example:/workdir -v $(pwd)/src/parsers/paulParser.js:/app/src/parsers/paulParser.js schnatterer/stock-alert
```

PRs for new parsers welcome.

## More feature ideas

- [ ] config contains readable name
- [ ] Alerts: Display readable name and stock url
- [ ] global alerts
- [ ] Parser: yahoo finance API
- [ ] gzipping prices for more efficient storage of huge numbers of prices
