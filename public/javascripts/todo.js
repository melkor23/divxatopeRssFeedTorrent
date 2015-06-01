(function () {
    var app = angular.module('showItemsapp', []);


    app.controller('ItemController', ['$http', function ($http) {
        var showItem = this;

        showItem.list = [];


        $http.get('./rss2').success(function (data) {
            showItem.list = data;
        }).
        error(function (data, status, headers, config) {
            alert("No se han podido recuperar los datos");
        });

         showItem.getLink = function (str) {

         };




        }]);
})();
