'use strict';

/**
 * @ngdoc service
 * @name sseFeApp.SaltBeaconService
 * @description
 * # SaltBeaconService
 * Factory in the sseFeApp.
 */
angular.module('sseFeApp')
    .factory('SaltBeaconService', ['$http', '$q', 'SaltUrlService', 'SaltConfig', function($http, $q, SaltUrlService, SaltConfig) {
        /* Get all the urls for beacons */
        var _urls = SaltUrlService.getUrls('beacons');

        /**
         * Public methods
         */
        return {
            /**
             * Get all Beacons available in system.
             * @return {object} $http Promise for the Ajax call
             */
            getBeaconsAll: function() {
                var config = {
                        method: 'get',
                        url: _urls.all,
                        headers: {
                            AUTHORIZATION: 'Token ' + SaltConfig.getUser().token
                        }
                    };

                return $http(config);
            },

            /**
             * Upload the beacon file
             * @param {object} beaconData The data for the beacon
             * @param {object} beaconFile The beacon file
             * @return {object} $http Promise for the Ajax call
             */
            uploadBeaconFile: function(beaconData, beaconFile) {
                /* jshint unused: false */
                var config = {
                        method: 'post',
                        url: _urls.upload,
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            AUTHORIZATION : 'Token ' + SaltConfig.getUser().token,
                        },
                        data: {
                            name: beaconData.name,
                            description: beaconData.description,
                            script: beaconFile
                        },
                        transformRequest: function (data, headersGetter) {
                            var formData = new FormData();
                            angular.forEach(data, function (value, key) {
                                formData.append(key, value);
                            });

                            var headers = headersGetter();
                            delete headers['Content-Type'];

                            return formData;
                        }
                    };

                return $http(config);
            },

            /**
             * Get the beacons for a target
             * @param {number} targetId The target Id
             * @return {object} $http Promise for the Ajax call
             */
            getTargetBeacons: function(targetId) {
                var config = {
                        method: 'get',
                        url: _urls.targetBeacons + targetId + '/beacons/',
                        headers: {
                            AUTHORIZATION: 'Token ' + SaltConfig.getUser().token
                        }
                    };

                return $http(config);
            },

            /**
             * Get stats for a target's beacons
             * @param {object} params URL parameters for the API
             * @return {object} $http Promise for the Ajax call
             */
            getTargetBeaconStats: function(params) {
                var config = {
                        method: 'get',
                        url: _urls.beaconStats,
                        params: params,
                        headers: {
                            AUTHORIZATION: 'Token ' + SaltConfig.getUser().token
                        }
                    };

                return $http(config);
            },
            
            /**
             * Get stats for a target's beacons
             * @param {object} params URL parameters for the API
             * @return {object} $http Promise for the Ajax call
             */
            getTargetBeaconEvents: function(params) {
                var config = {
                        method: 'get',
                        url: _urls.targetBeaconsEvent,
                        params: params,
                        headers: {
                            AUTHORIZATION: 'Token ' + SaltConfig.getUser().token
                        }
                    };

                return $http(config);
            }
        };
    }]);