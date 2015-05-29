(function () {
    var app = angular.module('aryalist', []);


    app.controller('PersonController', ['$http', function ($http) {
        var people = this;

        people.list = [];


        $http.get('./rss2').success(function (data) {
            people.list = data;
        }).
        error(function (data, status, headers, config) {
            alert("No e han podido recuperar los datos");
        });


        }]);
})();
