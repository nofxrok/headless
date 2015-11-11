'use strict';

/**
 * @ngdoc directive
 * @name sseFeApp.directive:saltFormFocus
 * @description # saltFormFocus
 */
angular.module('sseFeApp').directive('saltFormFocus', ['$timeout', function($timeout) {
    return {
        restrict : 'A',
        scope: {
            focus: '@'
        },
        link : function postLink(scope, element) {
            function doFocus() {
                $timeout(function() {
                  element[0].focus();
                }, 500);
            }

            if (scope.focus !== null) {
                // focus unless attribute evaluates to 'false'
                if (scope.focus !== 'false') {
                    doFocus();
                }

                // focus if attribute value changes to 'true'
                scope.$watch('focus', function(value) {
                    if (value === 'true') {
                        doFocus();
                    }
                });
            } else {
                // if attribute value is not provided - always focus
                doFocus();
            }
        }
    };
}]);
