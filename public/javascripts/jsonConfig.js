(function () {
    var app = angular.module('jsonconfig', []);

    app.controller('jsonController',['$scope','$http', function ($scope, $http) {
        $scope.name = 'World';
  $scope.jsonfile='';

        $http.get('/json').success(function(data){
                    $scope.jsonfile=JSON.stringify(data, null, '  ');
                });

        $scope.save = function () {

            $http.post('/json', this.jsonfile).success(function(data){alert('ok');});
        }
    }]);
})();
