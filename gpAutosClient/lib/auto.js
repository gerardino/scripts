var Auto = function Auto(id) {
    var dossierFilters = ["id", "marca", "modelo", "linea", "motor", "kilometraje", "origen", "transmision"];

    this.id = id;
    var source = this;

    this.getSummary = function getSummary() {
        var result = {}
        dossierFilters.forEach(function (k) {
            result[k] = source[k] || this[k];
        });
        return result;
    }
};


module.exports = Auto;
