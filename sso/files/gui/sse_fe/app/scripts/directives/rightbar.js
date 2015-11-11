'use strict';

/**
 * @ngdoc directive
 * @name sseFeApp.directive:rightbar
 * @description # rightbar
 */
angular.module('sseFeApp')
    .directive('rightbar', function() {
        return {
            templateUrl : 'views/directives/rightbar.html',
            restrict : 'E',
            scope : false,
            link: function() {
                //scope, elem, attr
            },
        };
});