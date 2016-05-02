var specificModel = false;

if (process.argv.length > 2) {
    specificModel = process.argv[2];
    console.log("Specified: ", specificModel);
}

var request = require('request'),
    cheerio = require('cheerio'),
    bluebird = require('bluebird'),

    gpa = require('./lib/gpAutos'),

    summaryFilter = ["Marca:", "Modelo:", "Linea:", "Motor:", "Kilometraje:", "Origen:", "Transmision:"],

    baseUrl = 'http://gpautos.net',
    filter = '/GP/carros/filtro',
    specificModelUrl = '/GP/carros/ver/',

    doRequest = function (url, input, callback) {
        request.post(url, {
            form: input
        },
            function (err, res, body) {
                if (!err && res.statusCode === 200) {
                    callback(body);
                } else if (err) {
                    console.log("Error!", err);
                }
            });
    },

    Input = function () {
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



    processCarPage = function (carId, body) {
        var vehicles = [];

        $ = cheerio.load(body);


        // jsdom.env(body, function(errors, window){
        // var $ = jQuery(window);

        var vehicle = {
            "Carro": carId,
        };

        console.log("Carro", carId);
        // console.log(">>", $('.cdata'));



        $('.cdata').each(function () {
            var attr = $(this).find('label').html();
            var value = $(this).find('span').html();

            if (specificModel || (!specificModel && summaryFilter.indexOf(attr) !== -1)) {
                console.log(attr, value);
                vehicle[attr] = value;
            }
        });

        $('.infoPrecio h1').each(function () {
            // console.log($(this).html());
            var precioLbl = $(this).html().split(':');
            vehicle[precioLbl[0]] = precioLbl[1];
        });

        if (!specificModel) {
            console.log("-------------------------------------------------------");
        }

        // });
    };



if (specificModel) {
    doRequest(baseUrl + specificModelUrl + specificModel, {}, function (body) {
        processCarPage(specificModel, body);
    });
} else {
    gpa.requestCars().then(function (cars) {
        if (cars.length === undefined) {
            console.log("Something has gone terribly wrong");
        } else if (cars.length === 0) {
            console.log("No vehicles found!");
        } else {
            console.log("Found ", cars.length, " items. Displaying first:\n%j", cars[0]);
        }
    });
}







// gp = require('./index')
