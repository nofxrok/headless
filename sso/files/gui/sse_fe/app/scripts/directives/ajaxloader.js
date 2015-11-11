'use strict';

/**
 * @ngdoc directive
 * @name sseFeApp.directive:ajaxLoader
 * @description # ajaxLoader
 */
angular.module('sseFeApp').directive('ajaxLoader', function() {
    return {
        templateUrl : 'views/directives/ajaxLoader.html',
        restrict : 'E',
        link : function postLink(scope, element) {
            scope.$on('loader_show', function() {
                element.show();
            });

            scope.$on('loader_hide', function() {
                element.hide();
            });
        }
    };
});
