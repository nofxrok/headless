'use strict';

/**
 * @ngdoc function
 * @name sseFeApp.controller:MinionsctrlCtrl
 * @description
 * # MinionsctrlCtrl
 * Controller of the sseFeApp
 */
angular.module('sseFeApp')
    .controller('MinionsCtrl', ['$scope', '$rootScope', 'SaltMinionService', '$timeout', '$state', '$stateParams', 'lodash', '$modal', 'growl', '$location', '$anchorScroll', function($scope, $rootScope, SaltMinionService, $timeout, $state, $stateParams, lodash, $modal, growl, $location, $anchorScroll) {
        /*jshint camelcase: false */
        $scope.selectedMinions = [];
        $scope.selectedMinionsIndex = [];
        $scope.previousPage = 0;
        $scope.nextPage = 0;
        $scope.nextQtPage = 0;
        $scope.previousQtPage = 0;
        $scope.nextTPage = 0;
        $scope.previousTPage = 0;
        $scope.previousHistoryPage = 0;
        $scope.nextHistoryPage = 0;
        $scope.previousMinionHistoryPage = 0;
        $scope.nextMinionHistoryPage = 0;
        $scope.addToTargetModal = {};
        $scope.deleteQTModal = {};
        $scope.saveTextFilterModal = {};
        $scope.saveGrainsFilterModal = {};
        $scope.jobReturnsModal = {};
        $scope.targetFolder = 'Please select a folder';
        $scope.selectedAll = false;
        $scope.targetSelectedAll = false;
        $scope.checkedMinions = [];
        $scope.showPagination = false;
        $scope.showQtPagination = false;
        $scope.showTPagination = false;
        $scope.showMinionHistoryPagination = false;
        $scope.target =[];
        $scope.target.is_fav = true;
        $scope.activeApply = true;
        $scope.minionsFiltered = false;
        $scope.currentFilter = {};
        $scope.stateParams = $stateParams;
        $scope.jobHistoryList = [];
        $scope.minionsJobHistory = [];
        $scope.loadingMessage = 'No job history for these minions.';
        $scope.currentPage = 1;
        $scope.textFiltersList = [];
        $scope.grainFiltersList = [];
        $scope.grainsData = {};

        var dataDict;

        /**
         * Get Target Minions Job History
         */
        $scope.getTargetJobHistory = function(historyPage) {
            var historyParams = {};
            $scope.loadingMessage = 'Please wait...';

            //Set page number if available
            if(typeof historyPage !== 'undefined') {
                historyParams.page = historyPage;
            }

            //Get all minions history on load
            SaltMinionService.getTargetJobHistory($state.params.targetId, historyParams)
            .then(function(response) {
                if(response.data.data.count > 0) {
                    $scope.jobHistoryList = response.data.data.results;
                    //$scope.totalHistory = response.data.data.count;

                    //Next and previous page numbers
                    $scope.nextHistoryPage = (response.data.data.next_page_number !== null) ? response.data.data.next_page_number : 0;
                    $scope.previousHistoryPage = (response.data.data.previous_page_number !== null) ? response.data.data.previous_page_number : 0;

                    //Show pagination if required
                    if($scope.previousHistoryPage !== 0 || $scope.nextHistoryPage !== 0) {
                        $scope.showPagination = true;
                    } else {
                        $scope.showPagination = false;
                    }
                } else {
                    $scope.historyList = [];
                    $scope.loadingMessage = 'No job history for this target.';
                }
            }, function(response) {
                switch(response.status) {
                    case 0:
                    case 500:
                        $scope.minionsError = 'Server Error.';
                    break;

                    case 401:
                        growl.error('Invalid token provided.');
                    break;

                    case 400:
                        if(response.data.error[0] === 'token_expired') {
                            growl.error('Token expired');
                        } else {
                            growl.error('Internal Server Error');
                        }
                    break;
                }
            });
        };

        /**
         * Get target job history next
         */
        $scope.getTargetJobHistoryNext = function() {
            $scope.getTargetJobHistory($scope.nextHistoryPage);
        };

        /**
         * Get target job history prev
         */
        $scope.getTargetJobHistoryPrev = function() {
            $scope.getTargetJobHistory($scope.previousHistoryPage);
        };

        /**
         * Get Minions
         * @param {number} minionsPage Page number
         */
        $scope.getMinions = function(minionsPage) {
            var minionsParams = {}, parameter;

            //Set page number if available
            if(typeof minionsPage !== 'undefined') {
                minionsParams.page = minionsPage;
            }

            //For a prticular master
            if(typeof $scope.minionsForMaster !== 'undefined' && $scope.minionsForMaster !== '') {
                minionsParams.mid = $scope.minionsForMaster;
            }

            //Set sorting parameter if set
            if(typeof $scope.sortingParameter !== 'undefined') {
                if($scope.sortingOrder === 'desc') {
                    parameter = '-' + $scope.sortingParameter;
                } else {
                    parameter = $scope.sortingParameter;
                }
                minionsParams.ordering = parameter;
            }

            //Get all minions on load
            SaltMinionService.getMinions(minionsParams)
            .then(function(response) {
                if(response.data.data.count > 0) {
                    $scope.minions = response.data.data.results;
                    $scope.totalMinions = response.data.data.count;
                    $scope.minions.forEach(function(){
                        $scope.checkedMinions.push(false);
                    });

                    if($state.current.name === 'salt.dashboard.resources.minions.master') {
                        $scope.toggleFilterView();
                        $scope.toggleFiltersDisplay('Text');
                        //Populate the text search form
                        $scope.textFilterCriteria.search_field = lodash.find($scope.searchFields, function(field) { return field.value === 2; });
                        $scope.textFilterCriteria.match_params = lodash.find($scope.matchParams, function(param) { return param.value === 5; });
                        $scope.textFilterCriteria.search_text = $scope.minions[0].master;
                    }

//                    //Load details of First Minion in list if no minion selected
//                    if($state.current.name === 'salt.dashboard.resources.minions') {
//                        $state.go('salt.dashboard.resources.minions.detail',{'minionId':$scope.minions[0].id, 'view':$stateParams.view});
//                        $scope.selectMinion(0, $scope.minions[0].id);
//                    }

                    //Next and previous page numbers
                    $scope.nextPage = (response.data.data.next_page_number !== null) ? response.data.data.next_page_number : 0;
                    $scope.previousPage = (response.data.data.previous_page_number !== null) ? response.data.data.previous_page_number : 0;
                    $scope.totalPages = response.data.data.total_page_number;
                    $scope.currentPage = $scope.nextPage === 0 ? $scope.totalPages : $scope.nextPage - 1;

                    //Checking for previous selected minions
                    if($rootScope.currentPage === $scope.currentPage){
                        if($rootScope.previousState === 'salt.dashboard.resources.minions-reports' || $rootScope.previousState === 'salt.dashboard.resources.minions-job-history'){
                            /*jshint unused:false*/
                            $rootScope.selectedMinions.forEach(function(v, i){
                                $scope.minions.forEach(function(val, ind){
                                    if(val.id === v){
                                        $scope.selectMinion(ind, v);
                                    }
                                });
                            });
                        }
                    } else {
                        $scope.selectedAll = true;
                        $scope.selectAll();
                    }
                    $rootScope.currentPage = $scope.currentPage;

                    //Show pagination if required
                    if($scope.previousPage !== 0 || $scope.nextPage !== 0) {
                        $scope.showPagination = true;
                    } else {
                        $scope.showPagination = false;
                    }

                    $scope.scrollToTop();
                }
            }, function(response) {
                switch(response.status) {
                    case 0:
                    case 500:
                        $scope.minionsError = 'Server Error.';
                    break;

                    case 401:
                        growl.error('Invalid token provided.');
                    break;

                    case 400:
                        if(response.data.error[0] === 'token_expired') {
                            growl.error('Token expired');
                        } else {
                            growl.error('Internal Server Error');
                        }
                    break;
                }
            });
        };

        /**
         * Get folder minions
         * @param {number} fPage Page number
         */
        $scope.getFolderMinions = function(fPage) {
            var fParams = {},
            parameter;

            //Set page number if available
            if(typeof fPage !== 'undefined') {
                fParams.page = fPage;
            }

            //Set sorting parameter if set
            if(typeof $scope.sortingParameter !== 'undefined') {
                if($scope.sortingOrder === 'desc') {
                    parameter = '-' + $scope.sortingParameter;
                } else {
                    parameter = $scope.sortingParameter;
                }
                fParams.ordering = parameter;
            }

              SaltMinionService.getFolderMinions($stateParams.folderId, fParams)
              .then(function(response) {
                  if(response.data.data.count > 0) {
                      $scope.minions = response.data.data.results;
                      $scope.currentFolder = $stateParams.folderId;
                      //$scope.$parent.$parent.$parent.state.current.data.pageTitle = 'Minions - ' + $scope.currentTarget.name;

                      //Next and previous page numbers
                      $scope.nextTPage = (response.data.data.next_page_number !== null) ? response.data.data.next_page_number : 0;
                      $scope.previousTPage = (response.data.data.previous_page_number !== null) ? response.data.data.previous_page_number : 0;
                      $scope.totalTPages = response.data.data.total_page_number;
                      $scope.currentTPage = $scope.nextTPage === 0 ? $scope.totalTPages : $scope.nextTPage - 1;

                      //Checking for previous selected minions
                      if($rootScope.currentPage === $scope.currentTPage){
                          if($rootScope.previousState === 'salt.dashboard.resources.folder-minions-job-history'){
                              /*jshint unused:false*/
                              $rootScope.selectedMinions.forEach(function(v, i){
                                  $scope.minions.forEach(function(val, ind){
                                      if(val.id === v){
                                          $scope.selectMinion(ind, v);
                                      }
                                  });
                              });
                          }
                      } else {
                          $scope.selectedAll = true;
                          $scope.selectAll();
                      }
                      $rootScope.currentPage = $scope.currentTPage;

                      //Load details of First Minion in list if no minion selected
////                      if($state.current.name !== 'salt.dashboard.resources.targets.minions') {
//                          $state.go('salt.dashboard.resources.folder.detail',{'minionId':$scope.minions[0].id, 'view':$stateParams.view});
//                          $scope.selectMinion(0, $scope.minions[0].id);
////                      }
                      //Show pagination if required
                      if($scope.previousTPage !== 0 || $scope.nextTPage !== 0) {
                          $scope.showTPagination = true;
                      }
                      $scope.scrollToTop();
                  }
              }, function(response) {
                  switch(response.status) {
                      case 0:
                      case 500:
                          growl.error('Some error occurred.');
                      break;

                      case 401:
                          growl.error('Invalid token provided.');
                      break;

                      case 404:
                          growl.error('Invalid url.');
                      break;
                  }
              });
        };
        
        
        
        /**
         * Get previous page of target minions
         */
        $scope.getFolderMinionsPrev = function() {
            $scope.getFolderMinions($scope.previousTPage);
        };

        /**
         * Get first page of target minions
         */
        $scope.getFolderMinionsFirst = function() {
            $scope.getFolderMinions(1);
        };

        /**
         * Get next page of target minions
         */
        $scope.getFolderMinionsNext = function() {
            $scope.getFolderMinions($scope.nextTPage);
        };

        /**
         * Get last page of target minions
         */
        $scope.getFolderMinionsLast = function() {
            $scope.getFolderMinions($scope.totalTPages);
        };
        
        /**
         * Get Scroll To top
         */
        
        $scope.scrollToTop = function() {
            var old = $location.hash();
            $location.hash('scroll-to-top');
            $anchorScroll();
            $location.hash(old);
        };

        /**
         * Get the previous page of minions
         */
        $scope.getMinionsPrev = function() {
            if($scope.minionsFiltered === false) {
                $scope.getMinions($scope.previousPage);
            } else {
                $scope.applyFilter($scope.previousPage);
            }
        };

        /**
         * Get the first page of minions
         */
        $scope.getMinionsFirst = function() {
            if($scope.minionsFiltered === false) {
                $scope.getMinions(1);
            } else {
                $scope.applyFilter(1);
            }
        };
        
        /**
         * Get the next page of minions
         */
        $scope.getMinionsNext = function() {
            if($scope.minionsFiltered === false) {
                $scope.getMinions($scope.nextPage);
            } else {
                $scope.applyFilter($scope.nextPage);
            }

        };

        /**
         * Get the last page of minions
         */
        $scope.getMinionsLast = function() {
            if($scope.minionsFiltered === false) {
                $scope.getMinions($scope.totalPages);
            } else {
                $scope.applyFilter($scope.totalPages);
            }
        };
        
        /**
         * Set sorting parameter
         */
        $scope.setSortingParameter = function(parameter) {
            $scope.sortingParameter = parameter;
            $scope.sortingOrder = $scope.sortingOrder === 'desc' ? 'asc' : 'desc';
            $scope.sortingBy = parameter + '-' + $scope.sortingOrder;

            $rootScope.sortingParameter = $scope.sortingParameter;
            $rootScope.sortingOrder = $scope.sortingOrder;
            $rootScope.sortingBy = $scope.sortingBy;

            if($scope.minionsFiltered === false) {
                if($state.current.name === 'salt.dashboard.resources.quicktargets' || $state.current.name === 'salt.dashboard.resources.quicktargets.minions'){
                    $scope.getQtMinions();
                } else if($state.current.name === 'salt.dashboard.resources.targets' || $state.current.name === 'salt.dashboard.resources.targets.minions'){
                    $scope.getTargetMinions();
                } else if($state.current.name === 'salt.dashboard.resources.minions' || $state.current.name === 'salt.dashboard.resources.minions.detail'){
                    $scope.getMinions();
                } 
            } else {
                $scope.applyFilter();
            }
        };

        /**
         * Show single minion
         */
        $scope.getMinion = function(minionId) {
            SaltMinionService.getMinion(minionId)
            .then(function(response) {
                if(response.data.data.count > 0) {
                    $scope.currentMinionDisplayed = response.data.data.results[0];
                    //$scope.getMinionJobDetails(minionId);
                }
            }, function(response) {
                switch(response.status) {
                    case 0:
                    case 500:
                        growl.error('Internal Server Error');
                    break;

                    case 401:
                        growl.error('Invalid token');
                    break;
                    
                    case 404:
                        growl.error('Invalid url');
                    break;
                }
            });

        };

        /**
         * Get Minion Job Details
         */
        
        $scope.getMinionJobDetails = function(minionId) {
            SaltMinionService.getMinionJobs(minionId)
            .then(function(response) {
                if(response.data.data.count > 0) {
                    $scope.currentMinionDisplayedJobs = response.data.data.results;
                }
            }, function(response) {
                switch(response.status) {
                    case 0:
                    case 500:
                        growl.error('Internal Server Error');
                    break;

                    case 401:
                        growl.error('Invalid token');
                    break;
                    
                    case 404:
                        growl.error('Invalid url');
                    break;
                }
            });
        };

        /**
         * Reload minions
         */
        $scope.reDiscoverMinions = function(){
            SaltMinionService.refreshMinions()
            .then(function(response) {
                if(response.status === 200) {
                    growl.info('grains.items executed successfully. Page will refresh in 3 seconds.');
                    $timeout(function() {
                        $state.go($state.current, {}, {reload: true});
                    }, 3000);
                }
            }, function() {
                //TODO after Growl integration
            });
        };

        /**
         * Select all minions
         */
        $scope.selectAll = function() {
            //Select all
            if(!$scope.selectedAll) {
                //First remove all selected minions
                $scope.selectedMinionsIndex = [];
                $scope.selectedMinions = [];

                //Add every minion into selected minion list
                for(var i = 0; i < $scope.minions.length; i++) {
                    $scope.selectedMinionsIndex.push(i);
                    $scope.selectedMinions.push($scope.minions[i].minionId);
                    $scope.checkedMinions[i] = true;
                }
                $scope.selectedMinions = lodash.pluck($scope.minions, 'id');
                //Set selected minions in the rootscope for use in other controllers
                $rootScope.selectedMinions = $scope.selectedMinions;
                $scope.selectedAll = true;

                var index = $scope.minions.length -1;
                var minionId = $scope.minions[index].id;
                if($state.current.name === 'salt.dashboard.resources.quicktargets'){
                    $state.go('salt.dashboard.resources.quicktargets.minions', {'minionId': minionId, 'view':$stateParams.view});
                } else if($state.current.name === 'salt.dashboard.resources.targets'){
                    $state.go('salt.dashboard.resources.targets.minions', {'minionId': minionId, 'view':$stateParams.view});
                } else if($state.current.name === 'salt.dashboard.resources.minions'){
                    $state.go('salt.dashboard.resources.minions.detail', {'minionId': minionId, 'view':$stateParams.view});
                }
//                $scope.selectMinion(index, minionId);
            }
            //Deselect all
            else {
                for(var j = 0; j < $scope.minions.length; j++) {
                    $scope.checkedMinions[j] = false;
                }

                //First remove all selected minions then add default first minion
                $scope.selectedMinionsIndex = [];
                $scope.selectedMinions = [];
                //Set selected minions in the rootscope for use in other controllers
                $rootScope.selectedMinions = $scope.selectedMinions;

                $scope.selectedAll = false;

                if($state.current.name === 'salt.dashboard.resources.quicktargets.minions'){
                    $state.go('salt.dashboard.resources.quicktargets', {'view':$stateParams.view});
                } else if($state.current.name === 'salt.dashboard.resources.targets.minions'){
                    $state.go('salt.dashboard.resources.targets', {'view':$stateParams.view});
                } else if($state.current.name === 'salt.dashboard.resources.minions.detail'){
                    $state.go('salt.dashboard.resources.minions', {'view':$stateParams.view});
                } 
            }

        };

        /**
         * Select minions for operations
         * @param {number} minionId Id if the minion selected
         */
        $scope.selectMinion = function(index, minionId) {
            $scope.checkedMinions[index] = $scope.checkedMinions[index]? false : true;
            minionId = parseInt(minionId, 10); //Typecast, very important!

            //Check if the minion id exists
            var newIndex = lodash.indexOf($scope.selectedMinions, minionId);

            //If not, add it and show details of selected minion
            if(newIndex === -1) {
                $scope.selectedMinionsIndex.push(index);
                $scope.selectedMinions.push(minionId);
                if($scope.selectedMinions.length === $scope.minions.length) {
                    $scope.selectedAll = true;
                }

                $scope.getMinion(minionId);

                $rootScope.selectedMinions = $scope.selectedMinions;

                if($state.current.name === 'salt.dashboard.resources.quicktargets' || $state.current.name === 'salt.dashboard.resources.quicktargets.minions'){
                    $state.go('salt.dashboard.resources.quicktargets.minions', {'minionId': minionId, 'view':$stateParams.view});
                } else if($state.current.name === 'salt.dashboard.resources.targets' || $state.current.name === 'salt.dashboard.resources.targets.minions'){
                    $state.go('salt.dashboard.resources.targets.minions', {'minionId': minionId, 'view':$stateParams.view});
                } else if($state.current.name === 'salt.dashboard.resources.minions' || $state.current.name === 'salt.dashboard.resources.minions.detail'){
                    $state.go('salt.dashboard.resources.minions.detail', {'minionId': minionId, 'view':$stateParams.view});
                } else if($state.current.name === 'salt.dashboard.resources.folder' || $state.current.name === 'salt.dashboard.resources.folder.detail'){
                    $state.go('salt.dashboard.resources.folder.detail', {'minionId': minionId, 'view':$stateParams.view});
                }
            }
            //Else remove it
            else {
                //if removing item added last then
                //select details for second last and remove last one
                if(newIndex+1 === $scope.selectedMinions.length && $scope.selectedMinions.length > 1) {
                    minionId = $scope.selectedMinions[newIndex - 1];
                    $scope.getMinion(minionId);

                    if($state.current.name === 'salt.dashboard.resources.quicktargets' || $state.current.name === 'salt.dashboard.resources.quicktargets.minions'){
                        $state.go('salt.dashboard.resources.quicktargets.minions', {'minionId': minionId, 'view':$stateParams.view});
                    } else if($state.current.name === 'salt.dashboard.resources.targets' || $state.current.name === 'salt.dashboard.resources.targets.minions'){
                        $state.go('salt.dashboard.resources.targets.minions', {'minionId': minionId, 'view':$stateParams.view});
                    } else if($state.current.name === 'salt.dashboard.resources.minions' || $state.current.name === 'salt.dashboard.resources.minions.detail'){
                        $state.go('salt.dashboard.resources.minions.detail', {'minionId': minionId, 'view':$stateParams.view});
                    }  else if($state.current.name === 'salt.dashboard.resources.folder' || $state.current.name === 'salt.dashboard.resources.folder.detail'){
                        $state.go('salt.dashboard.resources.folder.detail', {'minionId': minionId, 'view':$stateParams.view});
                    }
                }


                $scope.selectedMinionsIndex.splice(newIndex, 1);
                $scope.selectedMinions.splice(newIndex, 1);
                $scope.selectedAll = false;

                //Set selected minions in the rootscope for use in other controllers
                $rootScope.selectedMinions = $scope.selectedMinions;

                if($scope.selectedMinions.length === 0) {
                    $scope.selectedMinionsIndex.splice(newIndex, 1);
                    $scope.selectedMinions.splice(newIndex, 1);
                    //Set selected minions in the rootscope for use in other controllers
                    $rootScope.selectedMinions = $scope.selectedMinions;

                    if($state.current.name === 'salt.dashboard.resources.quicktargets.minions'){
                        $state.go('salt.dashboard.resources.quicktargets', {'view':$stateParams.view});
                    } else if($state.current.name === 'salt.dashboard.resources.targets.minions'){
                        $state.go('salt.dashboard.resources.targets', {'view':$stateParams.view});
                    } else if($state.current.name === 'salt.dashboard.resources.minions.detail'){
                        $state.go('salt.dashboard.resources.minions', {'view':$stateParams.view});
                    } else if($state.current.name === 'salt.dashboard.resources.folder.detail'){
                        $state.go('salt.dashboard.resources.folder', {'view':$stateParams.view});
                    }
                }
            }
        };

        /**
         * Get Target Groups
         */
        
        $scope.getTargetGroups = function() {
            $scope.activeApply = false;
            var selected = $scope.getSelectedMinionsList();
            SaltMinionService.getMinionTargetGroups(selected)
            .then(function(response) {
                dataDict = response.data.data.data_dict;
                $scope.targetGroups = angular.copy(dataDict);
            }, function(response) {
                switch(response.status) {
                    case 0:
                    case 404:
                    case 500:
                        growl.error('Internal Server Error');
                    break;
    
                    case 401:
                        growl.error('Unauthorized access');
                    break;
    
                    case 400:
                        growl.error('No targets available');
                    break;
                }
            });

            $scope.checkBoxStatus = function() {
                if(angular.equals(dataDict,$scope.targetGroups)) {
                    $scope.activeApply = false;
                } else {
                    $scope.activeApply = true;
                }
            };

            $scope.sendTargetList = function() {
                SaltMinionService.modifyMinionTargetGroups($scope.targetGroups,selected)
                .then(function(){
                    growl.success('Target Group modified successfully');
                }, function(response) {
                switch(response.status) {
                    case 0:
                    case 404:
                    case 500:
                        growl.error('Internal Server Error');
                    break;
                    case 401:
                        growl.error('Unauthorized access');
                    break;
                    case 400:
                        growl.error('No targets available');
                    break;
                    }
                });
            };
        };

        /**
         * Get selected minions
         */
        $scope.getSelectedMinionsList = function() {
            var selected = {};
            for(var i = 1; i <= $scope.selectedMinions.length; i++){
                selected['m'+i] = $scope.selectedMinions[i - 1];
            }
            return selected;
        };

        /**
         * Add selected minions to Quicktarget
         */
        $scope.addMinionsToQuickTarget = function() {
            if($scope.selectedMinions.length === 0) {
                growl.warning('Please select atleast one minion.');
                return;
            }

            var selected = {};
            for(var i = 1; i <= $scope.selectedMinions.length; i++){
                selected['m'+i] = $scope.selectedMinions[i - 1];
            }

            SaltMinionService.addToQuickTarget(selected)
            .then(function(response) {
                //Update count in the menu item
                $scope.$emit('quickTargetCountUpdate', response.data.data.total_minion);
                /*jshint camelcase: false */
                growl.success($scope.selectedMinions.length + ' Minions added to Quick Target');
            }, function(response) {
                switch(response.status) {
                    case 0:
                    case 500:
                        growl.error('Internal Server Error');
                    break;

                    case 401:
                        growl.error('Unauthorized access');
                    break;

                    case 400:
                        growl.error('No minions available');
                    break;
                }
            });
        };

        /**
         * Get quick target minions
         */
        $scope.getQtMinions = function(qtPage) {
            var qtParams = {},
                parameter;

            //Set page number if available
            if(typeof qtPage !== 'undefined') {
                qtParams.page = qtPage;
            }

            //Set sorting parameter if set
            if(typeof $scope.sortingParameter !== 'undefined') {
                if($scope.sortingOrder === 'desc') {
                    parameter = '-' + $scope.sortingParameter;
                } else {
                    parameter = $scope.sortingParameter;
                }
                qtParams.ordering = parameter;
            }

            //List Quick Targets
            SaltMinionService.getQuickTargetMinions(qtParams)
            .then(function(response) {
                if(response.data.data.count > 0) {
                    $scope.minions = response.data.data.results;
                    $scope.qtId = response.data.data.tgt_id;
                    //Next anqd previous page numbers
                    $scope.nextQtPage = (response.data.data.next_page_number !== null) ? response.data.data.next_page_number : 0;
                    $scope.previousQtPage = (response.data.data.previous_page_number !== null) ? response.data.data.previous_page_number : 0;
                    $scope.totalQtPages = response.data.data.total_page_number;
                    $scope.currentQtPage = $scope.nextQtPage === 0 ? $scope.totalQtPages : $scope.nextQtPage - 1;

                    //Checking for previous selected minions
                    if($rootScope.currentPage === $scope.currentQtPage){
                        if($rootScope.previousState === 'salt.dashboard.resources.quicktargets-reports' || $rootScope.previousState === 'salt.dashboard.resources.quicktargets-job-history'){
                            /*jshint unused:false*/
                            $rootScope.selectedMinions.forEach(function(v, i){
                                $scope.minions.forEach(function(val, ind){
                                    if(val.id === v){
                                        $scope.selectMinion(ind, v);
                                    }
                                });
                            });
                        }
                    } else {
                        $scope.selectedAll = true;
                        $scope.selectAll();
                    }
                    $rootScope.currentPage = $scope.currentQtPage;

                    //Load details of First Minion in list if no minion selected
////                    if($state.current.name !== 'salt.dashboard.resources.quicktargets.minions') {
//                        $state.go('salt.dashboard.resources.quicktargets.minions',{'minionId':$scope.minions[0].id, 'view':$stateParams.view});
//                        $scope.selectMinion(0, $scope.minions[0].id);
////                    }

                    //Show pagination if required
                    if($scope.previousQtPage !== 0 || $scope.nextQtPage !== 0) {
                        $scope.showQtPagination = true;
                    }
                    $scope.scrollToTop();
                }
            }, function(response) {
                switch(response.status) {
                    case 401:
                        growl.error('Unauthorized access.');
                    break;

                    case 0:
                    case 500:
                        growl.error('Some error occurred.');
                    break;

                    case 404:
                        growl.error('Invalid url.');
                    break;
                }
            });
        };

        /**
         * Get previous page of quick target minions
         */
        $scope.getQtMinionsPrev = function() {
            $scope.getQtMinions($scope.previousQtPage);
        };

        /**
         * Get first page of quick target minions
         */
        $scope.getQtMinionsFirst = function() {
            $scope.getQtMinions(1);
        };

        /**
         * Get next page of quick target minions
         */
        $scope.getQtMinionsNext = function() {
            $scope.getQtMinions($scope.nextQtPage);
        };

        /**
         * Get last page of quick target minions
         */
        $scope.getQtMinionsLast = function() {
            $scope.getQtMinions($scope.totalQtPages);
        };

        /**
         * Create target from selected minions
         * @param {string} fromQt Create target from a quick target
         */
        $scope.addSelectedMinionsToTarget = function(fromQt) {
            if($scope.selectedMinions.length === 0) {
                growl.error('Please select atleast one minion.');
                return;
            }

            $scope.addToTarget(true, fromQt);
        };

        /**
         * Create target from all minions
         */
        $scope.addMinionsToTarget = function(fromQt) {
            $scope.addToTarget(false, fromQt);
        };

        /**
         * Add to target modal confirmation
         * @param {boolean} addSelected Add only selected minions
         * @param {string} fromQt Create target from a quick target
         */
        $scope.addToTarget = function(addSelected, fromQt) {
            //Create
            $scope.target.name = '';
            $scope.target.foldername = $scope.targetPrivateFolderStructure[0].name;
            $scope.target.parent_id = $scope.targetPrivateFolderStructure[0].id;
            $scope.target.is_fav = true;
            $scope.addToTargetModal = $modal.open({
                templateUrl : 'views/dialogs/confirmAddToTarget.html',
                scope       : $scope,
                backdrop    : 'static'
            });

            //Change on radio button selection
            $scope.radioBtnChange = function(boolean) {
                if(boolean) {
                    $scope.target.foldername = $scope.targetPrivateFolderStructure[0].name;
                    $scope.target.parent_id = $scope.targetPrivateFolderStructure[0].id;
                } else {
                    $scope.target.foldername = $scope.targetPublicFolderStructure[0].name;
                    $scope.target.parent_id = $scope.targetPublicFolderStructure[0].id;
                }
            };

            //Accept
            $scope.addToTargetOk = function(target) {
                //Blank name not allowed
                if(!target || !target.name) {
                    return;
                }

                var params = { target_name: target.name, is_user_favorite:true, parent_id: target.parent_id };
                if(target.is_fav) {
                    params.is_user_favorite = false;
                }

                if(addSelected === true) {
                    var selected = {};
                    for(var i = 1; i <= $scope.selectedMinions.length; i++){
                        selected['m'+i] = $scope.selectedMinions[i - 1];
                    }

                    params.minion_id_info = selected;
                }

                $scope.target = target;

                SaltMinionService.addToTarget(params, addSelected)
                .then(function(response) {
                    //Close modal
                    $scope.addToTargetModal.close();

                    if(fromQt) {
                        growl.success('Quick target successfully added to target: '+response.data.data.target_name);
                    } else {
                        growl.success('Selected minions successfully added to target: '+response.data.data.target_name);
                    }

                    //Delete quick target if required
                    if($scope.target.deleteqt) {
                        $scope.removeQuickTarget();
                    } else {
                        $state.go($state.current, {}, {reload: true});
                    }
                }, function(response) {
                    //Dismiss modal
                    $scope.addToTargetModal.dismiss();
                    if(response.status === 400) {
                        switch(response.data.error[0]) {
                            case 'duplicate_target_name':
                                growl.error('Target already exists.');
                            break;

                            case 'target_name_empty':
                                growl.error('Target name empty.');
                            break;

                            case 'quick_target_doesnot_exists':
                                growl.error('Quick target not available.');
                            break;

                            case 'minion_doesnot_exists':
                                growl.error('Minion doesn\'t exist.');
                            break;

                            case 'parent_not_selected':
                                growl.error('Please select a folder for the target.');
                            break;
                            
                            case 'target_exists_at_same_level':
                                growl.error('Target name exists at the same level.');
                            break;
                        }
                    } else if(response.status === 401) {
                        growl.error('Unauthorized access.');
                    } else {
                        growl.error('Some error occurred.');
                    }
                });

                //$scope.addToTargetModal.close();
            };

            //Reject
            $scope.addToTargetCancel = function() {
                $scope.addToTargetModal.dismiss();
            };
        };

        /**
         * Delete Quick Target
         */
        $scope.confirmDeleteQT = function() {
            //Create
            $scope.deleteQTModal = $modal.open({
                templateUrl : 'views/dialogs/confirmDelete.html',
                scope       : $scope,
                backdrop    : 'static'
            });

            //Accept
            $scope.confirmDeleteOk = function() {
                $scope.deleteQTModal.close();
            };

            //Reject
            $scope.confirmDeleteCancel = function() {
                $scope.deleteQTModal.dismiss();
            };

            //Handle promise
            $scope.deleteQTModal.result.then(function() {
                //If no minions selected, delete the quick target
                if($scope.selectedMinions.length === 0) {
                    $scope.removeQuickTarget();
                } else {
                    $scope.removeQuickTargetMinions();
                }
            }, function() {
                //Nothing
            });
        };

        /**
         * Delete Quick Target
         */
        $scope.removeQuickTarget = function() {
            SaltMinionService.deleteQuickTarget()
            .then(function() {
                $state.go($state.current, {}, {reload: true});
            });
        };

        /**
         * Remove minion from the current users quick target
         * @param {number} minionId Id of the minion to be removed
         */
        $scope.removeQuickTargetMinion = function(minionId) {
            SaltMinionService.removeQuickTargetMinion(minionId)
            .then(function() {
                growl.success('Minion removed from Quick Target.');
                $state.go($state.current, {}, {reload: true});
            }, function(response) {
                if(response.status === 400 ) {
                    switch(response.data.error[0]) {
                        case 'token_not_provided':
                            growl.error('Token not provided.');
                        break;

                        case 'minion_doesnot_exists':
                            growl.error('Minion doesn not exist.');
                        break;
                    }
                } else if(response.status === 401) {
                    growl.error('Invalid token provided.');
                } else {
                    growl.error('Some error occurred.');
                }
            });
        };

        /**
         * Delete selected Quick Target minions
         */
        $scope.removeQuickTargetMinions = function() {
            var selected = {};
            for(var i = 1; i <= $scope.selectedMinions.length; i++){
                selected['m'+i] = $scope.selectedMinions[i - 1];
            }

            SaltMinionService.deleteQuickTargetMinions(selected)
            .then(function() {
                growl.success('Selected minions removed from quick target.');
                $state.go($state.current, {}, {reload: true});
            }, function(response) {
                switch(response.status) {
                    case 0:
                    case 500:
                        growl.error('Server side error occurred.');
                    break;

                    case 401:
                        growl.error('Unauthorized access.');
                    break;

                    case 404:
                        growl.error('Invalid URL.');
                    break;

                    case 400:
                        if(response.data.error[0] === 'invalid_minions') {
                            growl.error('Invalid minions.');
                        }
                    break;

                    default:
                        growl.error('Some error occurred.');
                    break;
                }
            });
        };

        /**
         * Get target minions
         * @param {number} tPage Page number
         */
        $scope.getTargetMinions = function(tPage) {
            var tParams = {},
            parameter;

            //Set page number if available
            if(typeof tPage !== 'undefined') {
                tParams.page = tPage;
            }

            //Set sorting parameter if set
            if(typeof $scope.sortingParameter !== 'undefined') {
                if($scope.sortingOrder === 'desc') {
                    parameter = '-' + $scope.sortingParameter;
                } else {
                    parameter = $scope.sortingParameter;
                }
                tParams.ordering = parameter;
            }

              SaltMinionService.getTargetMinions($stateParams.targetId, tParams)
              .then(function(response) {
                  if(response.data.data.count > 0) {
                      $scope.minions = response.data.data.results;
                      $scope.currentTarget = response.data.data.target; 
                      //$scope.$parent.$parent.$parent.state.current.data.pageTitle = 'Minions - ' + $scope.currentTarget.name;

                      //Next and previous page numbers
                      $scope.nextTPage = (response.data.data.next_page_number !== null) ? response.data.data.next_page_number : 0;
                      $scope.previousTPage = (response.data.data.previous_page_number !== null) ? response.data.data.previous_page_number : 0;
                      $scope.totalTPages = response.data.data.total_page_number;
                      $scope.currentTPage = $scope.nextTPage === 0 ? $scope.totalTPages : $scope.nextTPage - 1;

                      //Checking for previous selected minions
                      if($rootScope.currentPage === $scope.currentTPage){
                          if($rootScope.previousState === 'salt.dashboard.resources.target-reports' || $rootScope.previousState === 'salt.dashboard.resources.job-history-minion' || $rootScope.previousState === 'salt.dashboard.resources.job-history' || $rootScope.previousState === 'salt.dashboard.resources.target-eventstream'){
                              /*jshint unused:false*/
                              $rootScope.selectedMinions.forEach(function(v, i){
                                  $scope.minions.forEach(function(val, ind){
                                      if(val.id === v){
                                          $scope.selectMinion(ind, v);
                                      }
                                  });
                              });
                          }
                      } else {
                          $scope.selectedAll = true;
                          $scope.selectAll();
                      }
                      $rootScope.currentPage = $scope.currentTPage;

                      //Load details of First Minion in list if no minion selected
////                      if($state.current.name !== 'salt.dashboard.resources.targets.minions') {
//                          $state.go('salt.dashboard.resources.targets.minions',{'minionId':$scope.minions[0].id, 'view':$stateParams.view});
//                          $scope.selectMinion(0, $scope.minions[0].id);
////                      }
                      //Show pagination if required
                      if($scope.previousTPage !== 0 || $scope.nextTPage !== 0) {
                          $scope.showTPagination = true;
                      }
                      $scope.scrollToTop();
                  }
              }, function(response) {
                  switch(response.status) {
                      case 0:
                      case 500:
                          growl.error('Some error occurred.');
                      break;

                      case 401:
                          growl.error('Invalid token provided.');
                      break;

                      case 404:
                          growl.error('Invalid url.');
                      break;
                  }
              });
        };

        /**
         * Get previous page of target minions
         */
        $scope.getTargetMinionsPrev = function() {
            $scope.getTargetMinions($scope.previousTPage);
        };

        /**
         * Get first page of target minions
         */
        $scope.getTargetMinionsFirst = function() {
            $scope.getTargetMinions(1);
        };

        /**
         * Get next page of target minions
         */
        $scope.getTargetMinionsNext = function() {
            $scope.getTargetMinions($scope.nextTPage);
        };

        /**
         * Get last page of target minions
         */
        $scope.getTargetMinionsLast = function() {
            $scope.getTargetMinions($scope.totalTPages);
        };

        $scope.tooltip = {
            'qtaddbtntitle': 'Hello Tooltip<br />This is a multiline message.',
            'checked': false
        };

        /**
         * Filters functionality
         */
        $scope.filteredBy = {};
        $scope.filterView = false;
        $scope.filtersDisplayed = false;
        $scope.filtersLabel = 'On';
        $scope.showText = false;
        $scope.showGrains = false;
        $scope.showSaved = true;
        $scope.textFilterCriteria = {};
        $scope.currentlyDisplayedFilter = 'None';
        $scope.textFiltersList = [];
        $scope.grainFiltersList = [];
        $scope.searchFields = [
           { label: 'Node Name', value: 1 },
           { label: 'Master', value: 2 },
           { label: 'Target Group', value: 3 },
           { label: 'IP Address', value: 4 }
        ];

        $scope.matchParams = [
            { label: 'Contains', value: 1 },
            { label: 'Does not contain', value: 2 },
            { label: 'Starts with', value: 3 },
            { label: 'Ends with', value: 4 },
            { label: 'Is', value: 5 }
        ];

        /**
         * List all the existing filters
         */
//        $scope.listFilters = function() {
//            SaltMinionService.listFilters()
//            .then(function(response) {
//                if(response.data.data.count > 0) {
//                    $scope.textFiltersList = response.data.data.results;
//                }
//            }, function() {
//                //TODO
//            });
//        };
        $scope.listFilters = function() {
            SaltMinionService.listFilters()
            .then(function(response) {
                if(response.data.data.count > 0) {
                    response.data.data.results.forEach(function(v){
                        if(v.search_type === 1){
                            $scope.textFiltersList.push(v);
                        }
                        if(v.search_type === 2){
                            $scope.grainFiltersList.push(v);
                        }
                    });
                }
            }, function() {
                //TODO
            });
        };

        /**
         * Toggle filter view
         */
        $scope.toggleFilterView = function() {
            $scope.filterView = $scope.filterView ? false : true;

            //Get filters and grains only when required
            if($scope.filterView) {
                if($scope.textFiltersList.length === 0 || $scope.grainFiltersList.length === 0) {
                    $scope.listFilters();
                }

                if(lodash.size($scope.grainsData) < 1) {
                    $scope.getGrainsData();
                }
            }

            if($scope.filterView === false){
                $scope.clearFilter();
            }
        };

        /**
         * Toggle filters display
         */
        $scope.toggleFiltersDisplay = function(which) {
            //If hidden, show and set the current tab active
            if(!$scope.filtersDisplayed) {
                $scope.filtersDisplayed = true;
                $scope.currentlyDisplayedFilter = which;
                $scope['show' + which + 'Filter']();
            } else {
                //If same tab, then hide
                if($scope.currentlyDisplayedFilter === which) {
                    $scope.filtersDisplayed = false;
                    if(!$scope.minionsFiltered) {
                        $scope.currentlyDisplayedFilter = 'None';
                        $scope.clearFilter();
                        $scope.filterListLabel = 'Select filter';
                    }
                }
                //Else show
                else {
                    $scope.currentlyDisplayedFilter = which;
                    $scope['show' + which + 'Filter']();
                }
            }
        };

        /**
         * Toggle filter type to Text
         */
        $scope.showTextFilter = function() {
            if(!$scope.filtersDisplayed) {
                return false;
            }
            $scope.showText = true;
            $scope.showGrains = false;
            $scope.showSaved = false;
        };

        /**
         * Toggle filter type to Grains
         */
        $scope.showGrainsFilter = function() {
            if(!$scope.filtersDisplayed) {
                return false;
            }
            $scope.showText = false;
            $scope.showGrains = true;
            $scope.showSaved = false;
        };

        /**
         * Toggle filter type to Saved filters
         */
        $scope.showSavedFilter = function() {
            if(!$scope.filtersDisplayed) {
                return false;
            }
            $scope.showText = false;
            $scope.showGrains = false;
            $scope.showSaved = true;
        };

        /**
         * For pagination and sorting
         */
        $scope.applyFilter = function(page) {
            if($scope.currentFilter.search_type === 1) {
                $scope.applyTextFilter(page);
            } else {
                $scope.applyGrainsFilter(page);
            }
        };

        /**
         * Save text filter modal
         */
        $scope.saveTextFilterConfirm = function() {
            //If no criteria selected then warn the user
            if(lodash.size($scope.textFilterCriteria) === 0) {
                growl.info('Please select a combination');
                return;
            }

            //Create a modal for saving the filter
            $scope.saveTextFilterModal = $modal.open({
                templateUrl : 'views/dialogs/saveTextFilter.html',
                scope       : $scope,
                backdrop    : 'static'
            });

            //Save filter accept
            $scope.saveTextFilterOk = function(criteria) {
                //Normalize data
                $scope.saveTextFilterCriteria = {
                    filter_name: criteria.filter_name,
                    match_params: criteria.match_params.value,
                    search_field: criteria.search_field.value,
                    search_text: criteria.search_text,
                    search_type: 1
                };

                //Close the modal
                $scope.saveTextFilterModal.close();
            };

            //Cancel the operation
            $scope.saveTextFilterCancel = function() {
                $scope.saveTextFilterModal.dismiss();
            };

            //Handle the modal promise
            $scope.saveTextFilterModal.result.then(function() {
                $scope.saveTextFilter();
            }, function() {
                //Nothing
            });
        };

        /**
         * Save text filter
         */
        $scope.saveTextFilter = function() {
            SaltMinionService.saveTextFilter($scope.saveTextFilterCriteria)
            .then(function(response) {
                $scope.textFilterCriteria.filter_name = '';
                growl.success('Filter created: '+response.data.data.filter_name);
                $scope.listFilters();
            }, function(response) {
                switch(response.status) {
                    case 0:
                    case 500:
                        growl.error('Unknown server error');
                    break;

                    case 401:
                        growl.error('Unauthorized access');
                    break;

                    case 400:
                        if(response.data.error[0] === 'filter_name_exists') {
                            growl.error('Duplicate filter name');
                        } else if(response.data.error[0] === 'search_text_empty') {
                            growl.error('Please enter search text');
                        } else if(response.data.error[0] === 'filter_name_empty') {
                            growl.error('Please enter a name for the filter');
                        }
                    break;

                    default:
                        growl.error('Unknown error');
                    break;
                }
                
                //Reset the filter name
                $scope.textFilterCriteria.filter_name = '';
            });
        };

        /**
         * Apply a saved filter
         */
        $scope.applySelectedFilter = function() {
            if(typeof $scope.selectedFilter !== 'object') {
                growl.info('Please select a filter');
                return;
            }

            //Run the appropriate search based on the search type
            if($scope.selectedFilter.search_type === 1) {
                $scope.currentFilter = {
                    'in': $scope.selectedFilter.search_field,
                    'as': $scope.selectedFilter.match_parameters,
                    'text': $scope.selectedFilter.search_text,
                    'search_type': 1
                    
                };
                $scope.applyTextFilter();
            } else {
                $scope.currentFilter = JSON.parse($scope.selectedFilter.search_grains);
                $scope.currentFilter.search_type = 2;
                $scope.applyGrainsFilter();
            }

            $scope.minionsFiltered = true;
        };

        /**
         * Apply an unsaved text filter
         */
        $scope.applyLiveFilter = function() {
            //If no criteria mentioned, show a warning
            if(lodash.size($scope.textFilterCriteria) === 0 ||
                (!$scope.textFilterCriteria.search_text ||
                0 === $scope.textFilterCriteria.search_text.length)) {
                growl.info('Please select a filtering criteria.');
                return;
            }

            $scope.currentFilter = {
                'in': $scope.textFilterCriteria.search_field.value,
                'as': $scope.textFilterCriteria.match_params.value ,
                'text': $scope.textFilterCriteria.search_text,
                'search_type': 1
            };

            $scope.applyTextFilter();
            $scope.minionsFiltered = true;
        };

        /**
         * Apply text filter on the minions
         */
        $scope.applyTextFilter = function(minionsPage) {
            var parameter;
            //Set page number if available
            if(typeof minionsPage !== 'undefined') {
                $scope.currentFilter.page = minionsPage;
            }

            //Set sorting parameter if set
            if(typeof $scope.sortingParameter !== 'undefined') {
                if($scope.sortingOrder === 'desc') {
                    parameter = '-' + $scope.sortingParameter;
                } else {
                    parameter = $scope.sortingParameter;
                }
                $scope.currentFilter.ordering = parameter;
            }

            //Use quicktarget or target id if filtering on them
            if($state.current.name === 'salt.dashboard.resources.quicktargets' || $state.current.name === 'salt.dashboard.resources.quicktargets.minions') {
                $scope.currentFilter.tgt_id = $scope.qtId;
            } else if($state.current.name === 'salt.dashboard.resources.targets' || $state.current.name === 'salt.dashboard.resources.targets.minions') {
                $scope.currentFilter.tgt_id = $scope.currentTarget.id;
            } else if($state.current.name === 'salt.dashboard.resources.folder' || $state.current.name === 'salt.dashboard.resources.folder.detail') {
                $scope.currentFilter.folder_id = $scope.currentFolder;
            }

            //First remove all selected minions
            $scope.selectedMinionsIndex = [];
            $scope.selectedMinions = [];
            $scope.checkedMinions = [];
            $scope.selectedAll = false;
            $scope.currentMinionDisplayed = undefined;

            SaltMinionService.applyTextFilter($scope.currentFilter)
            .then(function(response) {
                if(response.data.data.count > 0) {
                    $scope.minions = response.data.data.results;
                    $scope.minions.forEach(function(){
                        $scope.checkedMinions.push(false);
                    });
                    //Load details of First Minion in list if no minion selected
                    /*if($state.current.name === 'salt.dashboard.resources.quicktargets' || $state.current.name === 'salt.dashboard.resources.quicktargets.minions') {
                        $state.go('salt.dashboard.resources.quicktargets.minions',{'minionId':$scope.minions[0].id, 'view':$stateParams.view});
                        $scope.selectMinion(0, $scope.minions[0].id);
                    }
                    if($state.current.name === 'salt.dashboard.resources.targets' || $state.current.name === 'salt.dashboard.resources.targets.minions') {
                        $state.go('salt.dashboard.resources.targets.minions',{'minionId':$scope.minions[0].id, 'view':$stateParams.view});
                        $scope.selectMinion(0, $scope.minions[0].id);
                    }
                    if($state.current.name === 'salt.dashboard.resources.minions.detail' || $state.current.name === 'salt.dashboard.resources.minions') {
                        $state.go('salt.dashboard.resources.minions.detail',{'minionId':$scope.minions[0].id, 'view':$stateParams.view});
                        $scope.selectMinion(0, $scope.minions[0].id);
                    }*/
                    //Update Next and previous page numbers
                    $scope.nextPage = (response.data.data.next_page_number !== null) ? response.data.data.next_page_number : 0;
                    $scope.previousPage = (response.data.data.previous_page_number !== null) ? response.data.data.previous_page_number : 0;
                    $scope.totalPages = response.data.data.total_page_number;
                    $scope.currentPage = $scope.nextPage === 0 ? $scope.totalPages : $scope.nextPage - 1;
                } else {
                    $scope.minions = [];
                    $scope.nextPage = 0;
                    $scope.previousPage = 0;
                    $scope.totalPages = 0;
                    $scope.currentPage = 0;
                }

                //Show pagination if required
                if($scope.previousPage !== 0 || $scope.nextPage !== 0) {
                    $scope.showPagination = true;
                } else {
                    $scope.showPagination = false;
                }
            }, function(response) {
                switch(response.status) {
                    case 0:
                    case 500:
                        growl.error('Unknown server error');
                    break;

                    case 401:
                        growl.error('Unauthorized access');
                    break;

                    default:
                        growl.error('Some error occurred');
                    break;
                }
            });
        };

        /**
         * Change selected filter label
         */
        $scope.setSelectedFilterLabel = function() {
            if($scope.textFilterCriteria.search_field === undefined || $scope.textFilterCriteria.match_params === undefined) {
                $scope.filterListLabel = 'Select filter';
            } else {
                $scope.filterListLabel = 'Custom filter';
            }
        };

        /**
         * Get the grains data
         */
        /*jshint unused:false*/
        $scope.getGrainsData = function() {
            SaltMinionService.getGrainsData()
            .then(function(response) {
                $scope.grainsData = response.data.data;
                $scope.grainsKeys = $scope.filterBlanks($scope.grainsData);
            }, function(response) {
                //TODO
            });
        };

        /**
         * Remove grains with no values
         */
        $scope.filterBlanks = function(data) {
            var nonBlanks = [];
            angular.forEach( data, function(value, key) {
                if(value.length > 0) {
                    nonBlanks.push(key);
                }
            });

            return nonBlanks;
        };

        /**
         * Normalize data
         */
        $scope.constructGrainsData = function() {
            $scope.grainsFilterData = {};

            //Format the data
            if($scope.grainsKeySelectedOne !== '' && $scope.grainsValueSelectedOne !== '') {
                //$scope.grainsFilterData[$scope.grainsKeySelectedOne] = $scope.grainsValueSelectedOne;
                $scope.grainsFilterData.grain1 = $scope.grainsKeySelectedOne;
                $scope.grainsFilterData.value1 = $scope.grainsValueSelectedOne;
            }

            if($scope.grainsKeySelectedTwo !== '' && $scope.grainsValueSelectedTwo !== '') {
                //$scope.grainsFilterData[$scope.grainsKeySelectedTwo] = $scope.grainsValueSelectedTwo;
                $scope.grainsFilterData.grain2 = $scope.grainsKeySelectedTwo;
                $scope.grainsFilterData.value2 = $scope.grainsValueSelectedTwo;
            }

            if($scope.grainsKeySelectedThree !== '' && $scope.grainsValueSelectedThree !== '') {
                //$scope.grainsFilterData[$scope.grainsKeySelectedThree] = $scope.grainsValueSelectedThree;
                $scope.grainsFilterData.grain3 = $scope.grainsKeySelectedThree;
                $scope.grainsFilterData.value3 = $scope.grainsValueSelectedThree;
            }
        };

        /**
         * Apply unsaved grains filter
         */
        $scope.applyLiveGrainsFilter = function() {
            //Normalize data
            $scope.constructGrainsData();

            //Set as currentFilter
            $scope.currentFilter = $scope.grainsFilterData;
            $scope.applyGrainsFilter();
        };

        /**
         * Apply grains filter
         */
        $scope.applyGrainsFilter = function(minionsPage) {
            var parameter;

            //Set page number if available
            if(typeof minionsPage !== 'undefined') {
                $scope.currentFilter.page = minionsPage;
            }

            //Set sorting parameter if set
            if(typeof $scope.sortingParameter !== 'undefined') {
                if($scope.sortingOrder === 'desc') {
                    parameter = '-' + $scope.sortingParameter;
                } else {
                    parameter = $scope.sortingParameter;
                }
                $scope.currentFilter.ordering = parameter;
            }

            //Pass target id or quick target id if on the targets page
            //Use quicktarget or target id if filtering on them
            if($state.current.name === 'salt.dashboard.resources.quicktargets' || $state.current.name === 'salt.dashboard.resources.quicktargets.minions') {
                $scope.currentFilter.tgt_id = $scope.qtId;
            } else if($state.current.name === 'salt.dashboard.resources.targets' || $state.current.name === 'salt.dashboard.resources.targets.minions') {
                $scope.currentFilter.tgt_id = $scope.currentTarget.id;
            } else if($state.current.name === 'salt.dashboard.resources.folder' || $state.current.name === 'salt.dashboard.resources.folder.detail') {
                $scope.currentFilter.folder_id = $scope.currentFolder;
            }

            //First remove all selected minions
            $scope.selectedMinionsIndex = [];
            $scope.selectedMinions = [];
            $scope.checkedMinions = [];
            $scope.selectedAll = false;
            $scope.currentMinionDisplayed = undefined;

            //Apply filters
            SaltMinionService.applyGrainFilters($scope.currentFilter)
            .then(function(response) {
                if(response.data.data.count > 0) {
                    $scope.minions = response.data.data.results;
                    $scope.minions.forEach(function(){
                        $scope.checkedMinions.push(false);
                    });
                    //Load details of First Minion in list if no minion selected
                    /*if($state.current.name === 'salt.dashboard.resources.quicktargets' || $state.current.name === 'salt.dashboard.resources.quicktargets.minions') {
                        $state.go('salt.dashboard.resources.quicktargets.minions',{'minionId':$scope.minions[0].id, 'view':$stateParams.view});
                        $scope.selectMinion(0, $scope.minions[0].id);
                    }
                    if($state.current.name === 'salt.dashboard.resources.targets' || $state.current.name === 'salt.dashboard.resources.targets.minions') {
                        $state.go('salt.dashboard.resources.targets.minions',{'minionId':$scope.minions[0].id, 'view':$stateParams.view});
                        $scope.selectMinion(0, $scope.minions[0].id);
                    }
                    if($state.current.name === 'salt.dashboard.resources.minions.detail' || $state.current.name === 'salt.dashboard.resources.minions') {
                        $state.go('salt.dashboard.resources.minions.detail',{'minionId':$scope.minions[0].id, 'view':$stateParams.view});
                        $scope.selectMinion(0, $scope.minions[0].id);
                    }*/

                    //Update Next and previous page numbers
                    $scope.nextPage = (response.data.data.next_page_number !== null) ? response.data.data.next_page_number : 0;
                    $scope.previousPage = (response.data.data.previous_page_number !== null) ? response.data.data.previous_page_number : 0;
                    $scope.totalPages = response.data.data.total_page_number;
                    $scope.currentPage = $scope.nextPage === 0 ? $scope.totalPages : $scope.nextPage - 1;
                } else {
                    $scope.minions = [];
                    $scope.nextPage = 0;
                    $scope.previousPage = 0;
                    $scope.totalPages = 0;
                    $scope.currentPage = 1;
                }

                //Show pagination if required
                if($scope.previousPage !== 0 || $scope.nextPage !== 0) {
                    $scope.showPagination = true;
                } else {
                    $scope.showPagination = false;
                }
            }, function(response) {
                switch(response.status) {
                    case 0:
                    case 500:
                        growl.error('Unknown server error');
                    break;

                    case 401:
                        growl.error('Unauthorized access');
                    break;

                    default:
                        growl.error('Some error occurred');
                    break;
                }
            });
        };

        /**
         * Save grains filter modal
         */
        $scope.saveGrainsFilterConfirm = function() {
            //Create a modal for saving the filter
            $scope.saveGrainsFilterModal =  $modal.open({
                templateUrl : 'views/dialogs/saveGrainsFilter.html',
                scope       : $scope,
                backdrop    : 'static'
            });

            //Save filter accept
            $scope.saveGrainsFilterOk = function(filterName) {
                //Normalize data
                $scope.constructGrainsData();

                $scope.saveGrainsFilterCriteria = {
                    filter_name: filterName,
                    search_grains: $scope.grainsFilterData,
                    search_type: 2
                };

                //Close the modal
                $scope.saveGrainsFilterModal.close();
            };

            //Cancel the operation
            $scope.saveGrainsFilterCancel = function() {
                $scope.saveGrainsFilterModal.dismiss();
            };

            //Handle the modal promise
            $scope.saveGrainsFilterModal.result.then(function() {
                $scope.saveGrainsFilter();
            }, function() {
                //Nothing
            });
        };

        /**
         * Save the grains filter
         */
        $scope.saveGrainsFilter = function() {
            SaltMinionService.saveGrainsFilter($scope.saveGrainsFilterCriteria)
            .then(function(response) {
                $scope.filter_name = '';
                growl.success('Filter created: '+response.data.data.filter_name);
                $scope.listFilters();
            }, function(response) {
                switch(response.status) {
                    case 0:
                    case 500:
                        growl.error('Unknown server error');
                    break;

                    case 401:
                        growl.error('Unauthorized access');
                    break;

                    case 400:
                        if(response.data.error[0] === 'filter_name_exists') {
                            growl.error('Duplicate filter name');
                        } else if(response.data.error[0] === 'search_text_empty') {
                            growl.error('Please enter search text');
                        } else if(response.data.error[0] === 'filter_name_empty') {
                            growl.error('Please enter a name for the filter');
                        }
                    break;

                    default:
                        growl.error('Unknown error');
                    break;
                }
            });
        };

        /**
         * Avoid duplicate selection
         */
        $scope.avoidDuplicateSelection = function(which) {
            switch(which) {
                case 1:
                    if($scope.grainsKeySelectedOne !== '' && ($scope.grainsKeySelectedOne === $scope.grainsKeySelectedTwo || $scope.grainsKeySelectedOne === $scope.grainsKeySelectedThree)) {
                        growl.error('Option already selected');
                        $scope.grainsKeySelectedOne = '';
                    }
                    $scope.grainsValueSelectedOne = '';
                break;

                case 2:
                    if($scope.grainsKeySelectedTwo !== '' && ($scope.grainsKeySelectedTwo !== '' && $scope.grainsKeySelectedTwo === $scope.grainsKeySelectedOne || $scope.grainsKeySelectedTwo === $scope.grainsKeySelectedThree)) {
                        growl.error('Option already selected');
                        $scope.grainsKeySelectedTwo = '';
                    }
                    $scope.grainsValueSelectedTwo = '';
                break;

                case 3:
                    if($scope.grainsKeySelectedThree !== '' && ($scope.grainsKeySelectedThree !== '' && $scope.grainsKeySelectedThree === $scope.grainsKeySelectedOne || $scope.grainsKeySelectedThree === $scope.grainsKeySelectedTwo)) {
                        growl.error('Option already selected');
                        $scope.grainsKeySelectedThree = '';
                    }
                    $scope.grainsValueSelectedThree = '';
                break;
            }

            if($scope.grainsKeySelectedOne === '' && $scope.grainsKeySelectedTwo === '' && $scope.grainsKeySelectedThree === '' && $scope.grainsValueSelectedOne === '' && $scope.grainsValueSelectedTwo === '' && $scope.grainsValueSelectedThree === '') {
                $scope.filterListLabel = 'Select filter';
                $scope.grainFilterFormValid = false;
            } else {
                $scope.filterListLabel = 'Custom filter';
            }
        };

        /**
         * Validation for filter form
         */
        $scope.grainFilterFormValid = false;
        $scope.validateForm = function(which) {
            if($scope['grainsValueSelected' + which] !== null) {
                $scope.grainFilterFormValid= true;
            } else {
                $scope.grainFilterFormValid= false;
            }
        };

        $scope.filterListLabel = 'Select filter';
        $scope.sampleSelectedFilter = function(selected) {
            $scope.filterListLabel = selected.filter_name;
            $scope.filtersDisplayed = true;
            if(selected.search_type === 1) {
                $scope.currentlyDisplayedFilter = 'Text';

                //Populate the text search form
                $scope.textFilterCriteria.search_field = lodash.find($scope.searchFields, function(field) { return field.value === selected.search_field; });
                $scope.textFilterCriteria.match_params = lodash.find($scope.matchParams, function(param) { return param.value === selected.match_parameters; });
                $scope.textFilterCriteria.search_text = selected.search_text;

                $scope.showTextFilter();
            } else {
                $scope.resetGrainFiltersForm();

                $scope.currentlyDisplayedFilter = 'Grains';
                var parsedGrains = JSON.parse(selected.search_grains);

                if(typeof parsedGrains.grain1 !== 'undefined') {
                    $scope.grainsKeySelectedOne = parsedGrains.grain1;
                    $scope.grainsValueSelectedOne = parsedGrains.value1;
                }

                if(typeof parsedGrains.grain2 !== 'undefined') {
                    $scope.grainsKeySelectedTwo = parsedGrains.grain2;
                    $scope.grainsValueSelectedTwo = parsedGrains.value2;
                }

                if(typeof parsedGrains.grain3 !== 'undefined') {
                    $scope.grainsKeySelectedThree = parsedGrains.grain3;
                    $scope.grainsValueSelectedThree = parsedGrains.value3;
                }

                $scope.grainFilterFormValid = true;
                $scope.showGrainsFilter();
            }
        };

        /**
         * Reset text filter form
         */
        $scope.resetTextFiltersForm = function() {
            $scope.textFilterCriteria = {};
        };

        /**
         * Reset grain filter form
         */
        $scope.resetGrainFiltersForm = function() {
            //Reset grains filters
            $scope.grainsKeySelectedOne = '';
            $scope.grainsValueSelectedOne = '';
            $scope.grainsKeySelectedTwo = '';
            $scope.grainsValueSelectedTwo = '';
            $scope.grainsKeySelectedThree = '';
            $scope.grainsValueSelectedThree = '';
        };

        /**
         * Clear currently applied filters and get all minions
         */
        $scope.clearFilter = function() {
            //Minions are not filtered anymore
            $scope.minionsFiltered = false;
            $scope.filtersDisplayed = false;
            $scope.currentlyDisplayedFilter = 'None';
            $scope.filterListLabel = 'Select filter';

            //Reset the selected filter
            $scope.selectedFilter = '';

            //Reset text filters
            $scope.resetTextFiltersForm();

            //Reset grain filters
            $scope.resetGrainFiltersForm();

            //The grain filter form is invalid now
            $scope.grainFilterFormValid = false;

            //Get non-filtered minions
            
            //State based function call
            if($state.current.name === 'salt.dashboard.resources.quicktargets.minions' || $state.current.name === 'salt.dashboard.resources.quicktargets') {
                $scope.getQtMinions();
            } else if($state.current.name === 'salt.dashboard.resources.targets.minions' || $state.current.name === 'salt.dashboard.resources.targets') {
                $scope.getTargetMinions();
            } else {
                $scope.minionsForMaster = '';
                $scope.getMinions();
            }
        };

        /**
         * Get job history for selected minions
         * @param {number} historyPage Page number for the history
         */
        $scope.getMinionsJobHistory = function(historyPage) {
            if(!$rootScope.selectedMinions || $rootScope.selectedMinions.length === 0) {
                return;
            }

            //Form url params object
            var params = {};

            //Set page number if available
            if(typeof historyPage !== 'undefined') {
                params.page = historyPage;
            }

            params.mids = $rootScope.selectedMinions.join();
            $scope.loadingMessage = 'Please wait...';

            SaltMinionService.getMinionsJobHistory(params)
            .then(function(response) {
                if(response.data.data.count > 0) {
                    $scope.minionsJobHistory = response.data.data.results;
                    if(lodash.size(response.data.data.pagination) !== 0) {
                        //Next and previous page numbers
                        $scope.nextMinionHistoryPage = (response.data.data.pagination.next_page_number !== null) ? response.data.data.pagination.next_page_number : 0;
                        $scope.previousMinionHistoryPage = (response.data.data.pagination.previous_page_number !== null) ? response.data.data.pagination.previous_page_number : 0;
                        $scope.totalMinionHistoryPages = response.data.data.pagination.total_pages;
                        $scope.currentMinionHistoryPage = $scope.nextPage === 0 ? $scope.totalPages : $scope.nextPage - 1;
                    }
                } else {
                    $scope.loadingMessage = 'No job history for these minions.';
                }

                //Show pagination if required
                if($scope.previousMinionHistoryPage !== 0 || $scope.nextMinionHistoryPage !== 0) {
                    $scope.showMinionHistoryPagination = true;
                } else {
                    $scope.showMinionHistoryPagination = false;
                }
            }, function(response) {
                switch(response.status) {
                    case 0:
                    case 500:
                        growl.error('Unknown server error');
                    break;

                    case 401:
                        growl.error('Unauthorized access');
                    break;

                    case 404:
                        growl.error('Invalid URL');
                    break;
                    
                    case 400:
                        growl.error('Unknown error');
                    break;
                }
            });
        };

        $scope.getMinionsJobHistoryNext = function() {
            $scope.getMinionsJobHistory($scope.nextMinionHistoryPage);
        };

        $scope.getMinionsJobHistoryPrev = function() {
            $scope.getMinionsJobHistory($scope.previousMinionHistoryPage);
        };
        
        $scope.getMinionsJobHistoryFirst = function() {
            $scope.getMinionsJobHistory(1);
        };

        $scope.getMinionsJobHistoryLast = function() {
            $scope.getMinionsJobHistory($scope.totalMinionHistoryPages);
        };

        /**
         * Get length of object
         */
        $scope.getObjectLength = function(obj){
            return lodash.size(obj);
        };

        /**
         * Key Accept and Delete functionality
         */
        $scope.keyAction = '';
        $scope.sendKeyAction = function() {
            var keyAction = $scope.keyAction,
                actionData = { minions: $scope.selectedMinions, action: keyAction };

            SaltMinionService.doKeyAction(actionData)
            /*jshint unused:false*/
            .then(function(response) {
                switch(keyAction) {
                    case 'accept':
                        growl.success('Key accepted successfully');
                    break;

                    case 'delete':
                        growl.success('Key deleted successfully');
                    break;

                    case 'reject':
                        growl.success('Key rejected');
                    break;

                    case 'deny':
                        growl.success('Key denied');
                    break;

                    case 'unaccept':
                        growl.success('Key unaccepted');
                    break;
                }
            }, function(response) {
                switch(response.status) {
                    case 0:
                    case 500:
                        growl.error('Internal Server Error');
                    break;

                    case 404:
                        growl.error('Invalid URL');
                    break;

                    case 401:
                        growl.error('Unauthorized access');
                    break;

                    case 400:
                        if(response.data.error[0] === 'minion_doesnot_exists') {
                            growl.error('No minion available');
                        } else if(response.data.error[0] === 'key_accept_failed') {
                            growl.error('Cannot accept key');
                        } else if(response.data.error[0] === 'key_delete_failed') {
                            growl.error('Cannot delete key');
                        } else if(response.data.error[0] === 'key_reject_failed') {
                            growl.error('Cannot reject key');
                        } else if(response.data.error[0] === 'key_deny_failed') {
                            growl.error('Cannot deny key');
                        } else if(response.data.error[0] === 'key_unaccept_failed') {
                            growl.error('Cannot unaccept key');
                        }
                    break;
                }
            });
        };

        /**
         * Show IP interfaces
         */
        $scope.showIPInterfaces = function(ip_interfaces){
            $scope.ipInterfaces = lodash.flatten(lodash.values(ip_interfaces));
        };
        
        /**
         * Get Enviournments to show on list
         */
        
        $scope.getEnvironment = function(env){
            $scope.env = lodash.flatten(lodash.values(env));
            $scope.envString = env.toString();
        };

        /**
         * Show Enviournments on Rollover
         */
        
        $scope.showEnvironment = function(env){
            $scope.env = lodash.flatten(lodash.values(env));
        };

        /**
         * Call function based on statuses
         */
        switch($state.current.name) {
            case 'salt.dashboard.resources.minions':
                $scope.mode = $stateParams.view === 'grid' ? 2 : 1;
                if($rootScope.previousState === 'salt.dashboard.resources.minions-reports' || $rootScope.previousState === 'salt.dashboard.resources.minions-job-history'){
                    $scope.sortingParameter = $rootScope.sortingParameter;
                    $scope.sortingOrder = $rootScope.sortingOrder;
                    $scope.sortingBy = $rootScope.sortingBy;
                    $scope.getMinions($rootScope.currentPage);
                } else {
                    $scope.getMinions();
                }
                //$scope.listFilters();
                //$scope.getGrainsData();
            break;

            case 'salt.dashboard.resources.minions.master':
                $scope.minionsForMaster = $state.params.masterId;
                $scope.getMinions();
                $scope.listFilters();
            break;

            case 'salt.dashboard.resources.minions.detail':
                $scope.mode = $stateParams.view === 'grid' ? 2 : 1;
                if(typeof $state.params.minionId !== 'undefined' && $state.params.minionId !== '') {
                    $scope.getMinion($state.params.minionId);
                }
                $scope.getMinions();
                //$scope.listFilters();
                //$scope.getGrainsData();
            break;

            case 'salt.dashboard.resources.targets.minions':
                $scope.mode = $stateParams.view === 'grid' ? 2 : 1;
                if(typeof $state.params.minionId !== 'undefined' && $state.params.minionId !== '') {
                    $scope.getMinion($state.params.minionId);
                }
                $scope.getTargetMinions();
                $scope.listFilters();
            break;

            case 'salt.dashboard.resources.quicktargets.minions':
                $scope.mode = $stateParams.view === 'grid' ? 2 : 1;
                if(typeof $state.params.minionId !== 'undefined' && $state.params.minionId !== '') {
                    $scope.getMinion($state.params.minionId);
                }
                $scope.getQtMinions();
                $scope.listFilters();
            break;

            case 'salt.dashboard.resources.quicktargets':
                $scope.mode = $stateParams.view === 'grid' ? 2 : 1;
                if($rootScope.previousState === 'salt.dashboard.resources.quicktargets-reports' || $rootScope.previousState === 'salt.dashboard.resources.quicktargets-job-history'){
                    $scope.sortingParameter = $rootScope.sortingParameter;
                    $scope.sortingOrder = $rootScope.sortingOrder;
                    $scope.sortingBy = $rootScope.sortingBy;
                    $scope.getQtMinions($rootScope.currentPage);
                } else {
                    $scope.getQtMinions();
                }
//                $scope.listFilters();
//                $scope.getGrainsData();
            break;

            case 'salt.dashboard.resources.targets':
                $scope.mode = $stateParams.view === 'grid' ? 2 : 1;
                //If target Id is not given, redirect to resources area
                if($stateParams.targetId === '') {
                    $state.go('salt.dashboard.resources.masters');
                    return;
                }

                //Get all minions for the current target
                if($rootScope.previousState === 'salt.dashboard.resources.target-reports' || $rootScope.previousState === 'salt.dashboard.resources.job-history' || $rootScope.previousState === 'salt.dashboard.resources.job-history-minion' || $rootScope.previousState === 'salt.dashboard.resources.target-eventstream'){
                    $scope.sortingParameter = $rootScope.sortingParameter;
                    $scope.sortingOrder = $rootScope.sortingOrder;
                    $scope.sortingBy = $rootScope.sortingBy;
                    $scope.getTargetMinions($rootScope.currentPage);
                } else {
                    $scope.getTargetMinions();
                }
//                $scope.listFilters();
//                $scope.getGrainsData();
            break;

            case 'salt.dashboard.resources.job-history':
                if(typeof $state.params.targetId !== 'undefined' && $state.params.targetId !== '') {
                    $scope.getTargetJobHistory();
                } else {
                    growl.info('Target id not specified.');
                }
            break;

            case 'salt.dashboard.resources.minions-job-history':
                $scope.mode = $stateParams.view === 'grid' ? 2 : 1;
                $scope.getMinionsJobHistory();
            break;
            
            case 'salt.dashboard.resources.job-history-minion':
                $scope.mode = $stateParams.view === 'grid' ? 2 : 1;
                $scope.getMinionsJobHistory();
            break;

            case 'salt.dashboard.resources.quicktargets-job-history':
                $scope.mode = $stateParams.view === 'grid' ? 2 : 1;
                $scope.getMinionsJobHistory();
            break;

            case 'salt.dashboard.resources.folder':
                $scope.mode = $stateParams.view === 'grid' ? 2 : 1;
                //Get all minions for the current target
                if($rootScope.previousState === 'salt.dashboard.resources.folder-minions-job-history'){
                    $scope.sortingParameter = $rootScope.sortingParameter;
                    $scope.sortingOrder = $rootScope.sortingOrder;
                    $scope.sortingBy = $rootScope.sortingBy;
                    $scope.getFolderMinions($rootScope.currentPage);
                } else {
                    $scope.getFolderMinions();
                }
//                $scope.listFilters();
//                $scope.getGrainsData();
            break;

            case 'salt.dashboard.resources.folder-minions-job-history':
                $scope.mode = $stateParams.view === 'grid' ? 2 : 1;
                $scope.getMinionsJobHistory();
            break;

            case 'salt.dashboard.resources.folder.quicktargets-job-history':
                $scope.mode = $stateParams.view === 'grid' ? 2 : 1;
                $scope.getMinionsJobHistory();
            break;

            case 'salt.dashboard.resources.folder.detail':
                $scope.mode = $stateParams.view === 'grid' ? 2 : 1;
                if(typeof $state.params.minionId !== 'undefined' && $state.params.minionId !== '') {
                    $scope.getMinion($state.params.minionId);
                }
                $scope.getFolderMinions();
                $scope.listFilters();
            break;
        }
    }]);
