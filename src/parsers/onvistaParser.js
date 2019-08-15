const htmlparser2 = require("htmlparser2");

const baseUrl = 'https://www.onvista.de';

class OnvistaParser {

    static createUrl(id) {
        return `${baseUrl}/${id}`;
    }

    static parse(html) {
        let isPrice = false;
        let price = undefined;

        let parser = new htmlparser2.Parser(
            {
                onopentag(name, attribs) {
                    if (name === "span" && attribs.class === "price" ) {
                        isPrice = true
                    } else if (name === "meta" && attribs.property === "schema:price") {
                        price = attribs.content
                    }
                },
                ontext(text) {
                    if (isPrice) {
                        price = text
                    }
                },
                onclosetag(name) {
                    isPrice = false
                }
            },
            {decodeEntities: true}
        );
        parser.write(html);
        parser.end();
        return price;
    }
}

module.exports = OnvistaParser;