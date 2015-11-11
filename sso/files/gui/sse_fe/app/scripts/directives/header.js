'use strict';

/**
 * @ngdoc directive
 * @name sseFeApp.directive:header
 * @description
 * # header
 */
angular.module('sseFeApp')
    .directive('header', function () {
        return {
            templateUrl: 'views/directives/header.html',
            restrict: 'E',
            link: function postLink() {
                //scope, element, attrs
            }
        };
    });
