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
        .controller('MainController', function($scope, $http, socket) {
            var self = this;
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
                    $http.post('http://localhost:3040/links', {
                        'links': $scope.links
                    });
                }
            }

            socket.on('open', function() {
                console.log('Oh my gosh, websocket is really open! Fukken awesome!');
            });

            socket.on('hello', function() {
                console.log('Got Hello! from server :)');
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
            });

            socket.on('dlProgress', function(data) {
                // console.log('DL Progress ! ');
                // console.log(data);

                $scope.dlInfo = data;
                // $scope.percent = data.percent + '%';
            });

            socket.on('convertStarted', function(data) {
                console.log(data);
                $scope.convertInfo = data;
                $scope.converting = "Converting " + data.filename + '...';
            });

            socket.on('convertSuccess', function(data) {
                console.log(data);
                $scope.audios.push(data);
                $scope.converting = {};
            });

            socket.on('convertError', function(data) {
                console.log(data);
                $scope.convertError = data;
            });

            socket.on('currentLinks', function(data) {
                console.log(data);
                $scope.audios = data;
            });
        });
})(angular, io);
