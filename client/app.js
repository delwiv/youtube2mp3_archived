(function(angular, eio) {
'use strict';
    angular.module('app', [])
    .config(['$httpProvider', function($httpProvider) {
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }]).controller('MainController', function($scope, $http) {

            var ws = eio.Socket('ws://localhost:3040/');

            $scope.downloads = [];
            $scope.info = '';
            $scope.dlInfo = '';

            ws.on('open', function() {
                console.log('Oh my gosh, websocket is really open! Fukken awesome!');

                ws.on('dlAdded', function(data) {
                    console.log('DL Added ! ' + data);
                    $scope.info += data;
                });

                ws.on('dlProgress', function(data) {
                   console.log('DL Progress ! ' + data);
                   $scope.dlInfo = data;
                })
            });



            $scope.links = [
                "https://www.youtube.com/watch?v=oDrC1l57fwU",
                "https://www.youtube.com/watch?v=2xLSZ3YEuTs"
            ]

            $scope.sendLink = function() {

                $http.post('http://localhost:3040/links', {
                    'links': $scope.links
                });
            }
        });
})(angular, eio);
