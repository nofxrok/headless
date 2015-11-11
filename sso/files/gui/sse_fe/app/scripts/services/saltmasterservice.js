'use strict';

/**
 * @ngdoc service
 * @name sseFeApp.SaltMasterService
 * @description # SaltMasterService Factory in the sseFeApp.
 */
angular.module('sseFeApp')
    .factory('SaltMasterService', ['$http', '$q', 'SaltUrlService', 'SaltConfig', function($http, $q, SaltUrlService, SaltConfig) {
        /* Get all the urls for master */
        var _urls = SaltUrlService.getUrls('master'),
            _currentMaster = {};

        /**
         * Public methods
         * Following the CRUD order
         */
        return {

            /**
             * Add a master with the details provided
             * @param {object} master Details collected from the form
             * @return {object} $http Promise for the Ajax call
             */
            addMaster: function(master) {
                var config = {
                        method: 'post',
                        url: _urls.add,
                        headers: { AUTHORIZATION : 'Token ' + SaltConfig.getUser().token },
                        data: master
                    };

                return $http(config);
            },

            /**
             * Get all the masters available
             * @param {object} params Pagination parameters
             * @return {object} $http Promise for the Ajax call
             */
            getMasters : function(params) {
                var config = {
                        method: 'get',
                        url: _urls.all,
                        headers: { AUTHORIZATION : 'Token ' + SaltConfig.getUser().token },
                        params: params
                    };

                return $http(config);
            },

            /**
             * Get a master
             * @param {string} hostname Hostname of the desired master
             * @return {object} $http Promise for the Ajax call
             */
            getMaster : function(hostname) {
                var config = {
                        method: 'get',
                        url: _urls.one + hostname + '/',
                        headers: { AUTHORIZATION : 'Token ' + SaltConfig.getUser().token }
                    };

                return $http(config);
            },

            /**
             * Edit a master
             * @param {object} master New details for the master being edited
             * @return {object} $http Promise for the Ajax call
             */
            editMaster: function(master) {
                var config = {
                        method: 'post',
                        url: _urls.edit + master.originalHostname + '/edit/',
                        headers: { AUTHORIZATION : 'Token ' + SaltConfig.getUser().token },
                        data: master
                    };

                return $http(config);
            },

            /**
             * Delete masters by ids
             * @param {object} hostnames Key value pairs to send masters ids as an object
             * @return {object} $http Promise for the Ajax call
             */
            deleteMasters : function(hostnames) {
                var config = {
                        method: 'post',
                        url: _urls.remove,
                        headers: { AUTHORIZATION : 'Token ' + SaltConfig.getUser().token },
                        data: hostnames
                    };

                return $http(config);
            },

            /**
             * Set a master for viewing
             */
            setCurrent: function(master) {
                _currentMaster = master;
            },

            /**
             * Get a master for viewing
             */
            getCurrent: function() {
                return _currentMaster;
            }
        };
    }]);
