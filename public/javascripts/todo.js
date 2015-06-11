(function () {
    var app = angular.module('showItemsapp', []);


    app.controller('ItemController', ['$http', function ($http) {
        var showItem = this;

        showItem.list = [];
        showItem.listAll = [];

        $http.get('./rss2').success(function (data) {
            showItem.list = data;
        }).error(function (data, status, headers, config) {
            alert("No se han podido recuperar los datos");
        });

        $http.get('./rssAll').success(function (data) {
            for (var i = 0; i < data.length; i++) {
                data[i].description[0] = data[i].description[0].substring(data[i].description[0].indexOf('src') + 'src="'.length, data[i].description[0].substring(data[i].description[0].indexOf('src') + 'src="'.length).indexOf('"') + 10);
            }

            showItem.listAll = data;
        }).error(function (data, status, headers, config) {
            alert("No se han podido recuperar los datos");
        });


       }]);
})();
