'use strict';

/**
 * @ngdoc directive
 * @name sseFeApp.directive:sidebar
 * @description
 * # sidebar
 */
angular.module('sseFeApp')
    .directive('sidebar',['$location', function (location) {
        return {
            templateUrl : 'views/directives/sidebar.html',
            restrict    : 'E',
            link        : function postLink(scope) {
                //scope, element, attrs
                scope.setActiveClass = function(current) {			
                    if (current !== location.$$url) {                    	
                        return '';
                    }
                    return 'active';
                };
            },

            controller: function($scope){
                $scope.isOpen = false;
            }
        };
    }]);
