'use strict';

/**
 * @ngdoc
 * @name sseFeApp.WebSockService
 * @description All the web socket related methods go here.
 * # WebSockService
 * Web Socket service
 */
angular.module('sseFeApp')
    .factory('WebSockService', function () {
            /*jshint camelcase: false */
            return {
                /**
                 * Websocket Connection
                 */
                connect: function(ws_url) {        
                    return  new WebSocket(ws_url);
                }
            };
    });
