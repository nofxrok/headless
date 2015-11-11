'use strict';

/**
 * @ngdoc function
 * @name sseFeApp.controller:MastersCtrl
 * @description
 * # MastersCtrl
 * Controller of the sseFeApp
 */
angular.module('sseFeApp')
    .controller('MastersCtrl', [ '$scope', 'SaltMasterService', '$q', '$modal', '$log', 'lodash','$state', '$stateParams', 'growl', function($scope, SaltMasterService, $q,$modal, $log, lodash, $state, $stateParams, growl) {
        var hostname = '';
        $scope.masters = undefined;
        $scope.selectedMasters = [];
        $scope.confirmDeleteModal = {};
        $scope.previousPage = 0;
        $scope.nextPage = 0;
        $scope.selectedAll = false;
        $scope.checkedMasters = [];
        $scope.showPagination = false;

        $scope.userDetails = [];
        $scope.userName = [];

        /**
         * Get all masters
         */
        $scope.getMasters = function(mastersPage) {
            var mastersParams = {};

            //Set page number if available
            if(typeof mastersPage !== 'undefined') {
                mastersParams.page = mastersPage;
            }

            SaltMasterService.getMasters(mastersParams)
            .then(function(response) {
                if(response.data.data.count > 0) {
                    $scope.masters = response.data.data.results;
                    $scope.masters.forEach(function(){
                        $scope.checkedMasters.push(false);
                    });
                    //Extract next and previous page numbers
                    if(response.data.data.next !== null) {
                        $scope.nextPage = response.data.data.next.split('?')[1].split('=')[1];
                    } else {
                        $scope.nextPage = 0;
                    }

                    if(response.data.data.previous !== null) {
                        $scope.previousPage = response.data.data.previous.split('?')[1].split('=')[1];
                    } else {
                        $scope.previousPage = 0;
                    }

                    /*jshint camelcase: false */
                    $scope.totalPages = response.data.data.total_page_number;
                    $scope.currentPage = $scope.nextPage === 0 ? $scope.totalPages : $scope.nextPage - 1;

                    //Show pagination if required
                    if($scope.previousPage !== 0 || $scope.nextPage !== 0) {
                        $scope.showPagination = true;
                    }
                }
                else{
                    $scope.masters = [];
                }
            }, function(response) {
                switch(response.status) {
                    case 0:
                    case 500:
                        growl.error('Internal Server Error');
                    break;

                    case 401:
                        growl.error('Unauthorized access');
                    break;

                    case 404:
                        growl.error('Invalid URL');
                    break;

                    case 400:
                        switch(response.data.error[0]) {
                            case 'token_not_provided':
                                growl.error('Token not provided');
                            break;
                        }
                    break;
                }
            });
        };

        /**
         * Get the previous page of masters
         */
        $scope.getMastersPrev = function() {
            $scope.getMasters($scope.previousPage);
        };
        
        /**
         * Get the first page of masters
         */
        $scope.getMastersFirst = function() {
            $scope.getMasters(1);
        };

        /**
         * Get the next page of masters
         */
        $scope.getMastersNext = function() {
            $scope.getMasters($scope.nextPage);
        };

        /**
         * Get the last page of masters
         */
        $scope.getMastersLast = function() {
            $scope.getMasters($scope.totalPages);
        };

        /**
         * Accept the form data and add the master
         * @param {object} master The master data to be added
         */
        $scope.addMaster = function(master) {
            SaltMasterService.addMaster(master)
            .then(function() {
                //Show notice and reload the current view
                growl.success('Master created successfully');
                $state.go('salt.dashboard.settings.masters.list', {}, { reload: true });
            }, function(response) {
                switch (response.status) {
                    case 0:
                    case 500:
                        growl.error('Unknown server error');
                    break;

                    case 401:
                        if(response.data.error[0] === 'no_route_to_host') {
                            growl.error('Master not reachable');
                        } else {
                            growl.error('Unauthorized access');
                        }
                    break;

                    case 400:
                        if(response.data.error[0] === 'no_route_to_host') {
                            growl.error('Master not reachable');
                        } else if('duplicate_master') {
                            growl.error('FQDN already exists');
                        } else {
                            growl.error('Invalid credentials');
                        }
                    break;

                    default:
                        growl.error('Something went wrong');
                    break;
                }
                master = {};
            });
        };

        /**
         * Single master details
         * @param {string} hostname The hostname of the master to be displayed
         * @param {boolean} editMaster Whether the master is fetched for edit
         */
        $scope.showMaster = function(hostname, editMaster) {
            SaltMasterService.getMaster(hostname)
            .then(function(response) {
                if(response.data.data.count > 0) {
                    //Set currently displayed single master
                    SaltMasterService.setCurrent(response.data.data.results[0]);

                    if(editMaster === 'edit'){
                        //Current edited master
                        $scope.currentMasterEdit = response.data.data.results[0];
                        $scope.currentMasterEdit.originalHostname = $scope.currentMasterEdit.hostname;
                    } else {
                        $scope.selectedRow = editMaster;
                        $scope.currentMasterDisplayed = response.data.data.results[0];

                        /*jshint camelcase: false */
                        $scope.userDetails = $scope.currentMasterDisplayed.mastertoken_set;
                        $scope.userName = $scope.userDetails[0];
                    }
                }
            }, function(response) {
                switch(response.status) {
                    case 0:
                        growl.error('Internal Server Error');
                    break;

                    case 401:
                        growl.error('Unauthorized access');
                    break;

                    case 404:
                        growl.error('Server not reachable');
                    break;
                }
            });
        };

        /**
         * Select/De-select all masters
         */
        $scope.selectAll = function() {
            //Select all
            if(!$scope.selectedAll) {
                for(var i = 0; i < $scope.masters.length; i++) {
                    $scope.checkedMasters[i] = true;
                }
                $scope.selectedMasters = lodash.pluck($scope.masters, 'hostname');
                $scope.selectedAll = true;
            }
            //Deselect all
            else {
                for(var j = 0; j < $scope.masters.length; j++) {
                    $scope.checkedMasters[j] = false;
                }
                $scope.selectedMasters = [];
                $scope.selectedAll = false;
            }
        };

        /**
         * Select masters for delete
         * @param {string} hostname The hostname of the master to be deleted
         */
        $scope.selectMaster = function(index, hostname) {
            $scope.checkedMasters[index] = $scope.checkedMasters[index]? false : true;
            //Check if the hostname exists
            index = lodash.indexOf($scope.selectedMasters, hostname);

            //If not, add it
            if(index === -1) {
                $scope.selectedMasters.push(hostname);
                if($scope.selectedMasters.length === $scope.masters.length) {
                    $scope.selectedAll = true;
                }
            }
            //Else remove it
            else {
                $scope.selectedMasters.splice(index, 1);
                $scope.selectedAll = false;
            }
        };

        /**
         * Delete masters confirmation modal
         */
        $scope.confirmDelete = function() {
            if($scope.masters.length === 0) {
                growl.warning('Please add master');
                return false;
            } else if($scope.selectedMasters.length === 0) {
                growl.warning('Please select atleast one master');
                return false; 
            }

            //Create
            $scope.confirmDeleteModal = $modal.open({
                templateUrl : 'views/dialogs/confirmDeleteMasters.html',
                scope       : $scope,
                backdrop    : 'static'
            });

            //Accept
            $scope.confirmDeleteOk = function() {
                $scope.confirmDeleteModal.close();
            };

            //Reject
            $scope.confirmDeleteCancel = function() {
                $scope.confirmDeleteModal.dismiss();
            };

            //Handle promise
            $scope.confirmDeleteModal.result.then(function() {
                $scope.deleteMasters();
            }, function() {
                //Nothing
            });
        };

        /**
         * Delete the selected masters
         */
        $scope.deleteMasters = function() {
            var selected = {};
            for(var i = 1; i <= $scope.selectedMasters.length; i++){
                selected['h'+i] = $scope.selectedMasters[i - 1];
            }

            //Send the masters list to the server for deletion
            SaltMasterService.deleteMasters(selected)
            .then(function(response) {
                if(response.status === 200) {
                	growl.success('Selected masters deleted');
                    $state.go($state.current, {}, {reload: true});
                    $scope.selectedMasters = [];
                }
            }, function() {
            	growl.error('Internal Server Error');
            });
        };

        /**
         * Edit a master
         * @param {object} master The master data to be edited
         */
        $scope.editMaster = function(master) {
            //Remove master token set
            /*jshint camelcase: false */
            delete master.mastertoken_set;

            SaltMasterService.editMaster(master)
            .then(function() {
                $state.go('salt.dashboard.settings.masters.list', {}, {reload: true});
            }, function(response) {
                switch(response.status) {
                    case 0:
                    case 500:
                        growl.error('Unknown server error');
                    break;

                    case 400:
                        growl.error('Incorrect data provided');
                    break;

                    case 401:
                        if(response.data.error[0] === 'invalid_master_credentials') {
                            growl.error('Invalid credentials');
                        } else if(response.data.error[0] === 'no_route_to_host') {
                            growl.error('Master not reachable');
                        }
                    break;

                    default:
                        growl.error('Something went wrong');
                    break;                    
                }
            });
        };

        switch($state.current.name) {
            case 'salt.dashboard.resources.masters':
            case 'salt.dashboard.settings.masters.list':
            	$scope.mode = $stateParams.view === 'grid' ? 2 : 1;
                $scope.getMasters();
            break;

            case 'salt.dashboard.resources.masters.detail':
                //If the hostname is not specified, then redirect to masters list
                if(typeof $state.params.hostname !== 'undefined' && $state.params.hostname !== '' ) {
                    hostname = $state.params.hostname;
                    $scope.showMaster(hostname);
                }
                $scope.getMasters();
            break;

            case 'salt.dashboard.settings.masters.edit':
                //If the hostname is not specified, then redirect to masters list
                if(typeof $state.params.masterId !== 'undefined' && $state.params.masterId !== '' ) {
                    hostname = $state.params.masterId;
                    $scope.showMaster(hostname, 'edit');
                }
            break;
        }
    }]);
