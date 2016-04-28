var specificModel = false;

if (process.argv.length > 2) {
    specificModel = process.argv[2];
    console.log("Specified: ", specificModel);
}

var cheerio = require('cheerio'),
    request = require('request'),

    summaryFilter = ["Marca:", "Modelo:", "Linea:", "Motor:", "Kilometraje:", "Origen:", "Transmision:"],

    Input = function() {
        return {
            'AnioMinimo': '2005',
            'AnioMaximo': '2015',
            'Marca': 'HONDA',
            'Linea': 'CIVIC',
            'Combustible': 'todos',
            'Origen': 'todos',
            'Transmision': 'todos',
            'Moneda': '',
            'RangoMinimo': '',
            'RangoMaximo': '60000',
            'Departamento': 'todos',
            'Tipo': 'usado',
            'TipoVehiculo': 'automovil'
                // 'TipoVehiculo': 'camionetilla'
        };
    },

    baseUrl = 'http://gpautos.net',
    filter = '/GP/carros/filtro',
    specificModelUrl = '/GP/carros/ver/',

    doRequest = function(url, input, callback) {
        request.post(url, {
                form: input
            },
            function(err, res, body) {
                if (!err && res.statusCode === 200) {
                    callback(body);
                } else if (err) {
                    console.log("Error!", err);
                }
            });
    },

    carUrlRegex = /\/GP\/carros\/ver\/[0-9]{5}/gi,
    requestCars = function(input) {

        if (input === undefined) {
            input = new Input();
        }

        var url = baseUrl + filter;

        doRequest(url, input, function(body) {
            var matches = body.match(carUrlRegex);

            if (matches.length === 0) {
                console.log("No results");
            } else {
                matches.forEach(function(carUrl) {
                    doRequest(baseUrl + carUrl, {}, function(body) {
                        processCarPage(carUrl.substring(carUrl.lastIndexOf('/') + 1), body)
                    });

                });

                // var carUrl = matches[0];


            }
        });
    },

    processCarPage = function(carId, body) {
        var vehicles = [];

        $ = cheerio.load(body);


        // jsdom.env(body, function(errors, window){
        // var $ = jQuery(window);

        var vehicle = {
            "Carro": carId,
        };

        console.log("Carro", carId);
        // console.log(">>", $('.cdata'));



        $('.cdata').each(function() {
            var attr = $(this).find('label').html();
            var value = $(this).find('span').html();

            if (specificModel || (!specificModel && summaryFilter.indexOf(attr) !== -1)) {
                console.log(attr, value);
                vehicle[attr] = value;
            }
        });

        $('.infoPrecio h1').each(function() {
            // console.log($(this).html());
            var precioLbl = $(this).html().split(':');
            vehicle[precioLbl[0]] = precioLbl[1];
        });

        if (!specificModel) {
            console.log("-------------------------------------------------------");
        }

        // });
    };

module.exports = {
    Input: Input,
    doRequest: doRequest,
    // request: request,
    requestCars: requestCars
}


if (specificModel) {
    doRequest(baseUrl + specificModelUrl + specificModel, {}, function(body) {
        processCarPage(specificModel, body);
    });
} else {
    requestCars();
}







// gp = require('./index')
