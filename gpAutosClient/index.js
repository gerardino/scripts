var specificModel = false;

if (process.argv.length > 2) {
    specificModel = process.argv[2];
    console.log("Specified: ", specificModel);
}

var request = require('request'),
    cheerio = require('cheerio'),
    bluebird = require('bluebird'),

    gpa = require('./lib/gpAutos');

if (specificModel) {
    gpa.requestCar(specificModel).then(function (data) {
        console.log(data);
    });

} else {
    gpa.requestCars().then(function (cars) {
        if (cars.length === undefined) {
            console.log("Something has gone terribly wrong");
        } else if (cars.length === 0) {
            console.log("No vehicles found!");
        } else {
            console.log("Found ", cars.length, " items. Displaying first:\n", cars[0].getSummary());
        }
    });
}