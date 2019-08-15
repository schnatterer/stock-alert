jest.mock('fs', () => require('memfs').fs);

const Parser = require('../../src/parsers/onvistaParser');

describe('url', () => {
    test('is created as expected', () => {
        expect(Parser.createUrl('some/stock')).toEqual('https://www.onvista.de/some/stock')
    })
});

describe('Parsing returns', () => {

    test('price from <span class="price">', () => {
        const htmlSpanPrice = '  <html><body> sd bla <span class="something">23</span><span class="price">42.0 EUR</span></body></html> '

        expect(Parser.parse(htmlSpanPrice)).toEqual('42.0 EUR')
    });

    test('price from <meta property="schema:price">', () => {
        const htmlSpanPrice = '  <html><body> sd bla <meta property="schema:something">23</meta><meta property="schema:price" content="42.0 EUR">89.0</meta></body></html> '

        expect(Parser.parse(htmlSpanPrice)).toEqual('42.0 EUR')
    });

    test('undefined if nothing found', () => {
        const htmlSpanPrice = '  <html><body> sd bla <span class="something">23</span><span class="priceS">42.0 EUR</span></body></html> '

        expect(Parser.parse(htmlSpanPrice)).toBeUndefined()
    });

});