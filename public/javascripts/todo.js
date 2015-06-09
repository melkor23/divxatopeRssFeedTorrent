(function () {


    var app = angular.module('showItemsapp', ['phonecatFilters']).filter('newlines', function (text) {
        return text.replace(/\n/g, '<br/>');
    });
    app.filter('unsafe', function ($sce) {
        return function (val) {
            return $sce.trustAsHtml(val);
        };
    });
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
                data[i].description[0] = data[i].description[0].substring(data[i].description[0].indexOf('src') + 'src="'.length, data[i].description[0].substring(data[i].description[0].indexOf('src') + 'src="'.length).indexOf('"')+10);

            }


            showItem.listAll = data;
        }).error(function (data, status, headers, config) {
            alert("No se han podido recuperar los datos");
        });






        showItem.getLink = function (str) {

        };


        showItem.filter = function (str) {
            console.log('filter!!!!!!!!');
            //return str.replace('\\"', '');
        }

        /*
                $http.get('http://www.divxatope.com/feeds.xml').success(function (response) {
                    if (response.statusCode === 200) {
                        var parser = new xml2jsParser.Parser();
                        var xmlObject = null;
                        parser.parseString(response.body, function (err, result) {
                            console.log('Result All items');
                            showItem.listAll = result;
                        });

                    }
                });

        */


       }]);
})();
