(function () {
    var app = angular.module('searchModule', []);

    app.controller('searchController', ['$scope', '$http', '$timeout', '$sce', function ($scope, $http, $timeout, $sce) {
        $scope.searchWord = '';
        $scope.searchList = '';
        $scope.resultCount = 0;


        $scope.busquedaActiva = false;

        app.config(['$httpProvider', function ($httpProvider) {
                $httpProvider.defaults.useXDomain = true;
                delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }

]);


        $scope.searchClick = function () {
            //alert('Palabra buscada: ' + $scope.searchWord);
            $scope.busquedaActiva = true;

            var req = {
                method: 'GET',
                url: '/prueba?search=' + $scope.searchWord
            };

            $http(req).success(function (data) {

                /*
                data = data.replace('<br>', '');
                var auxString = '<ul ' + data.substring(data.search('"peliculas-box"') + '"peliculas-box"'.length)
                var ulElements = auxString.substring(0, auxString.search('<!-- end .peliculas-box -->'));
                //var xmlDoc = $.parseXML(ulElements);
                ulElements = ulElements.replace(/<li style="width:136px;height:275px;margin:0px 15px 0px 0px;">/g, '<li class="panel panel-default shadow container col-md-2 ng-scope"> ');

                ulElements = ulElements.replace(/<strong style="float:left;width:100%;text-align:center;color:#000;margin:0px;padding:3px 0px 0px 0px;font-size:11px;line-height:12px;">/g, '<strong class="tamanyofuente">');

                ulElements = ulElements.replace(/<h2 style="float:left;width:100%;margin:3px 0px 0px 0px;padding:0px 0px 3px 0px;line-height:12px;font-size:12px;height:23px;border-bottom:solid 1px #C2D6DB;">/g, '<h2 class="tamanyofuente">');

                ulElements = ulElements.replace(/<a href="/g, '<a href="/AddTorrent?url=');

                $scope.searchList = ulElements;
                */
                $scope.searchList = data;
                $scope.busquedaActiva = false;
                $scope.resultCount = data.total_results;

            }).error(function () {

                alert('Error');
                $scope.busquedaActiva = false;
            });





        }
        $scope.SkipValidation = function (value) {
            return $sce.trustAsHtml($scope.searchList);
        };

        $scope.AddTorrent = function (titulo, link, htmlLink) {




            //recuperamos la imagen
               var req = {
                method: 'GET',
                url: '/AddtorrentSearch?title=' + titulo+
                   '&torrent='+link+
                   '&htmlLink='+htmlLink
            };

            $http(req).success(function (data) {
        });




    }}]);

    app.filter('bytes', function () {
        return function (bytes, precision) {
            if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
            if (typeof precision === 'undefined') precision = 1;
            var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
                number = Math.floor(Math.log(bytes) / Math.log(1024));
            return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number];
        }
    });


    /*
    //
    //Filters!!!
    //
    */

    app.filter('shortTitle', function () {
        return function (title, precision) {

            return title.length > 20 ? title.substring(0, 40) + ' ...' : title;
        }
    });

    app.filter('specialCharacters', function () {
        return function (word, precision) {

            return word.replace('&Ntilde;', 'Ñ').replace('&ntilde;', 'ñ');
        }
    });



})();
