'use strict';

/**
 * @ngdoc directive
 * @name sseFeApp.directive:footer
 * @description
 * # footer
 */
angular.module('sseFeApp')
    .directive('footer', function () {
        return {
            templateUrl: 'views/directives/footer.html',
            restrict: 'E',
            link: function postLink() {
                //scope, element, attrs
            }
        };
    });
