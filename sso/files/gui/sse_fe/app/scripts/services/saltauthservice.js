'use strict';

/**
 * @ngdoc
 * @name sseFeApp.SaltAuthService
 * @description All the authentication related methods go here.
 * # SaltAuthService
 * Salt Authentication service
 */
angular.module('sseFeApp')
    .factory('SaltAuthService', ['$http', '$q', 'SaltConfig', '$state', 'SaltUrlService', function ($http, $q, SaltConfig, $state, SaltUrlService) {
        //Get all the user urls
        var _urls = SaltUrlService.getUrls('user');

        return {
            /**
             * Log the user in
             */
            login: function(user) {
                var config = {
                        url: _urls.authenticate,
                        method: 'post',
                        data: user
                    };

                return $http(config);
            },

            /**
             * Log the user out
             */
            logout: function() {
                SaltConfig.destroyUser();
                $state.go('salt.login');
            },

            /**
             * Check if the user is logged in
             */
            isUserLoggedIn: function() {
                return !!SaltConfig.getUser();
            },

            getTargetData: function() {
                var config = {
                        headers: {
                            AUTHORIZATION : 'Token '+SaltConfig.getUser().token
                        }
                    };

                return $http.get(_urls.count, config);
            }
        };
    }]);
