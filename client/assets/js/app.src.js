(function(angular, io) {
    'use strict';
    angular.module('app', [])
        .factory('socket', ['$rootScope', function($rootScope) {

            var socket = io.connect();

            return {
                on: function(eventName, callback) {
                    socket.on(eventName, function() {
                        var args = arguments;
                        $rootScope.$apply(function() {
                            callback.apply(socket, args);
                        });
                    });
                },
                emit: function(eventName, data, callback) {
                    socket.emit(eventName, data, function() {
                        var args = arguments;
                        $rootScope.$apply(function() {
                            if (callback) {
                                callback.apply(socket, args);
                            }
                        });
                    })
                }
            };

        }])
        // .factory('socket', function(socketFactory) {
        //     return socketFactory();
        // })
        .config(['$httpProvider', function($httpProvider) {
            $httpProvider.defaults.useXDomain = true;
            delete $httpProvider.defaults.headers.common['X-Requested-With'];
        }])
        .controller('MainController', function($scope, $http, socket, $location) {
            var self = this;
            self.baseUrl = $location.absUrl();
            $scope.downloads = [];
            $scope.infos = [];
            $scope.taLinks = '';
            $scope.dlInfo = '';
            $scope.audios = [];

            // socket.send({foo: 'ping'});



            $scope.links;

            $scope.sendLink = function() {
                if (self.socket) {
                    socket.send('links', $scope.links);
                } else {
                    $http.post(self.baseUrl + 'links', {
                        'links': $scope.links
                    });
                }
            }

            socket.on('open', function() {
                console.log('Oh my gosh, websocket is really open! Fukken awesome!');
            });

            socket.on('hello', function() {
                $http.get('/audio').then(function(response) {
                    var files = response.data;
                    for (var i in files) {
                        var filename = files[i];
                        var path = self.baseUrl + 'audio/' + filename;
                        $scope.audios.push({
                            filename: filename,
                            path: path
                        });
                    }
                })
            })

            socket.on('dlAdded', function(data) {
                // console.log('DL Added ! ');
                // console.log(data);
                $scope.infos.push(data);
            });

            socket.on('dlStarted', function(data) {
                // console.log('DL Started ! ');
                // console.log(data);
                $scope.infos.push(data);
                $scope.error = '';
            });

            socket.on('dlProgress', function(data) {
                // console.log('DL Progress ! ');
                // console.log(data);

                $scope.dlInfo = data;
                // $scope.percent = data.percent + '%';
            });

            socket.on('dlError', function(data) {
                $scope.error = data;
            });

            socket.on('convertStarted', function(data) {
                console.log(data);
                $scope.convertInfo = data;
                $scope.converting = data;
            });

            socket.on('convertSuccess', function(data) {
                console.log(data);
                var filename = data.filename;
                var path = self.baseUrl + 'audio/' + filename;
                $scope.audios.push({
                    filename: filename,
                    path: path
                });
                $scope.converting = '';
            });

            socket.on('convertError', function(data) {
                console.log(data);
                $scope.convertError = data;
            });

            socket.on('currentLinks', function(data) {

                _.forEach(data, function(value) {
                    console.log(value);
                    var filename = value.filename;
                    var path = self.baseUrl + 'audio/' + filename;

                    $scope.audios.push({
                        filename: filename,
                        path: path
                    });
                });


            });
        });
})(angular, io);


//# sourceMappingURL=app.src.js.map