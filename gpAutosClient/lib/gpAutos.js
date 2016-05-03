var //request = require('request'),
    cheerio = require('cheerio'),
    bluebird = require('bluebird'),
    restling = require('restling'),

    f = require('./functions'),
    Filters = require('./filters'),
    Auto = require('./auto'),

    baseUrl = 'http://gpautos.net',
    filter = '/GP/carros/filtro',
    specificModelUrl = '/GP/carros/ver/',

    summaryFilter = ["Marca:", "Modelo:", "Linea:", "Motor:", "Kilometraje:", "Origen:", "Transmision:"],

    carUrlRegex = /\/GP\/carros\/ver\/[0-9]{5}/gi,

    requestCars = function (input) {
        if (!input) {
            input = new Filters.Input();
        }

        var url = baseUrl + filter;

        return restling.post(url, {
            data: input
        }).then(function (body) {


            var matches = body.data.match(carUrlRegex),
                promises = [];

            if (matches.length === 0) {
                console.log("No results");

                return [];
            } else {
                var counter = 0;
                var limit = 1;
                matches.forEach(function (carUrl) {
                    if (counter < limit) {
                        promises.push(restling.post(baseUrl + carUrl).then(function (body) {
                            return processCarPage(carUrl.substring(carUrl.lastIndexOf('/') + 1), body);
                        }));
                        counter++;
                    }

                });

                return bluebird.all(promises);
            }
        });
    },


    normalizeAttr = function (str) {
        return f.camelize(str.replace(':', ''))
    },

    processCarPage = function processCarPage(carId, body) {
        var $ = cheerio.load(body.data),
            // vehicle = { "Id": carId }
            vehicle = new Auto(carId)
            ;

        $('.cdata').each(function () {
            var attr = normalizeAttr($(this).find('label').html());
            var value = $(this).find('span').html();

            vehicle[attr] = value;

            // if (specificModel || (!specificModel && summaryFilter.indexOf(attr) !== -1)) {
            //     console.log(attr, value);
            //     vehicle[attr] = value;
            // }
        });

        $('.infoPrecio h1').each(function () {
            // console.log($(this).html());
            var precioLbl = $(this).html().split(':');
            vehicle[normalizeAttr(precioLbl[0])] = precioLbl[1];
        });

        return vehicle;
    },
    
    requestCar = function requestCar(id){
        if (id){
            return restling.post(baseUrl + specificModelUrl + id).then(function(body){
                return processCarPage(id, body);
            });
        } else {
            return new error("Invalid id");
        }
    };

module.exports = {
    requestCars: requestCars,
    requestCar : requestCar
}
