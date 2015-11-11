'use strict';

/**
 * @ngdoc directive
 * @name sseFeApp.directive:mastersList
 * @description # mastersList
 */
angular.module('sseFeApp').directive('mastersList', function() {
    return {
        templateUrl : 'views/mastersList.html',
        restrict : 'E',
        link : function postLink() {
            // scope, element, attrs
            // Coming soon
        }
    };
});
