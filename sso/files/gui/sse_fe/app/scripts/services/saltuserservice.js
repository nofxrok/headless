'use strict';

/**
 * @ngdoc service
 * @name sseFeApp.Saltuserservice
 * @description
 * # Saltuserservice
 * Service in the sseFeApp.
 */
angular.module('sseFeApp')
    .factory('SaltUserService', ['$http', '$q', 'SaltUrlService', 'SaltConfig', function($http, $q, SaltUrlService, SaltConfig) {
        /* Get all the urls for user */
        var _urls = SaltUrlService.getUrls('user'),
            _currentUser = {};

        /**
         * Public methods
         * Following the CRUD order
         */
        return {

            /**
             * Add a user with the details provided
             * @param {object} user Details collected from the form
             * @return {object} $http Promise for the Ajax call
             */
            addUser : function(user){
                var config = {
                        method: 'post',
                        url: _urls.add,
                        headers: { AUTHORIZATION : 'Token ' + SaltConfig.getUser().token },
                        data: user
                    };

                return $http(config);
            },

            /**
             * Get all the users available
             * @param {object} params Pagination parameters
             * @return {object} $http Promise for the Ajax call
             */
            getUsers : function(params){
                var config = {
                        method: 'get',
                        url: _urls.all,
                        headers: { AUTHORIZATION : 'Token ' + SaltConfig.getUser().token },
                        params: params
                    };

                return $http(config);
            },

            /**
             * Get a user
             * @param {string} user Id of the desired user
             * @return {object} $http Promise for the Ajax call
             */
            getUser: function(user) {
                var config = {
                        method: 'get',
                        url: _urls.one + user + '/',
                        headers: { AUTHORIZATION : 'Token ' + SaltConfig.getUser().token }
                    };

                return $http(config);
            },

            /**
             * Edit a user
             * @param {object} user New details for the user being edited
             * @return {object} $http Promise for the Ajax call
             */
            editUser : function(user){
                var config = {
                        method: 'post',
                        url: _urls.edit + user.id + '/edit/',
                        headers: { AUTHORIZATION : 'Token ' + SaltConfig.getUser().token },
                        data: user
                    };

                return $http(config);
            },

            /**
             * Delete users by ids
             * @param {object} users Key value pairs to send user ids as an object
             * @return {object} $http Promise for the Ajax call
             */
            deleteUsers : function(users){
                var config = {
                        method: 'post',
                        url: _urls.remove,
                        headers: { AUTHORIZATION : 'Token ' + SaltConfig.getUser().token },
                        data: users
                    };

                return $http(config);
            },

            /**
             * Set a user for viewing
             */
            setCurrentUser : function(user){
                _currentUser = user;
            },

            /**
             * Get a user for viewing
             */
            getCurrentUser : function(){
                return _currentUser;
            }
        };
    }]);
