'use strict';

/**
 * @ngdoc function
 * @name sseFeApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Salt Login Controller
 */
angular.module('sseFeApp')
    .controller('LoginCtrl', ['$scope', '$location', 'SaltAuthService', 'SaltMasterService', 'SaltConfig', '$state', 'lodash', 'growl', function ($scope, $location, SaltAuthService, SaltMasterService, SaltConfig, $state, lodash, growl) {
        $scope.user     = {};

        /**
         * Login the user with the form data
         * @param {object} user The login credentials
         */
        $scope.login    = function(user) {
            $scope.user = user;
            SaltAuthService.login($scope.user)
                .then(function(response) {
                    growl.success('Welcome to SaltStack Enterprise');
                    SaltConfig.setUser(response.data.data);

                    /*jshint camelcase: false */
                    //If saltadmin
                    if(response.data.data.is_staff){
                    	SaltMasterService.getMasters()
                    	.then(function(response) {
                    	    if (response.data.data.results.length <= 0) {
                                $state.go('salt.dashboard.settings.masters.add');
                            } else {
                                $state.go('salt.dashboard.resources.masters');
                            }
                        }, function() {
                            growl.error('Internal Server Error');
                        });
                    }
                    else{
                        //Redirect
                        $state.go('salt.dashboard.resources.masters', {view: 'list'});
                    }
                }, function(response) {
                    switch(response.status) {
                        case 0:
                        case 500:
                            growl.error('Internal Server Error');
                        break;
                        
                        case 404:
                            growl.error('Internal Server Error');
                        break;
                        
                        case 401:
                            if(response.data.error[0] === 'unauthorized_access') {
                                growl.error('Username or Password is incorrect');
                            }
                        break;
                        
                        default:
                            growl.error('Some error occurred');
                        break;
                    }
                });
            };
    }]);

