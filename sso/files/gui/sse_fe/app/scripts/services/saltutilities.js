'use strict';

/**
 * @ngdoc service
 * @name sseFeApp.SaltUtilities
 * @description
 * # SaltUtilities
 * Factory in the sseFeApp.
 */
angular.module('sseFeApp')
    .factory('SaltUtilities', ['$location', function (location) {
        // Service logic
        // ...

        // Public API here
        return {
            checkPage: function (page) {
                if(location.$$url === page){
                    return true;
                }
            }
        };
    }]);
