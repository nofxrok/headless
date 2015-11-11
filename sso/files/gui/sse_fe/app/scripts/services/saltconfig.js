'use strict';

/**
 * @ngdoc
 * @name sseFeApp.SaltConfig
 * @description All global configuration variables go here.
 * # SaltConfig
 * Salt Global Configuration
 */
angular.module('sseFeApp')
    .factory('SaltConfig', ['$window', function($window) {
        /**
         * Public methods
         */
        return {
            /**
             * Sets current user data
             * @param {object} user Logged in user data
             */
            setUser: function(user) {
                $window.localStorage.setItem('user', JSON.stringify(user));
            },

            /**
             * Return current user's data
             * @return {object} Current user's config object
             */
            getUser: function() {
                return JSON.parse($window.localStorage.getItem('user'));
            },

            /**
             * Destroy user data, hence invalidating the session
             */
            destroyUser: function(){
                $window.localStorage.removeItem('user');
            },

            /**
             * Set a value in the localstorage
             * @param {string} key The key
             * @param {string} value The value
             */
            setData: function(key, value) {
                $window.localStorage.setItem(key, value);
            },

            /**
             * Get a value from the localstorage
             * @param {string} key The required key
             * @return {string} The value
             */
            getData: function(key) {
                return $window.localStorage.getItem(key);
            },

            /**
             * Remove a key from the localstorage
             * @param {string} key The key to be removed
             */
            removeData: function(key) {
                $window.localStorage.removeItem(key);
            }
        };
    }]);
