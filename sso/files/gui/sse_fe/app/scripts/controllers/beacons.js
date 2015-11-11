'use strict';

/**
 * @ngdoc function
 * @name sseFeApp.controller:BeaconsCtrl
 * @description
 * # BeaconsCtrl
 * Controller of the sseFeApp
 */
angular.module('sseFeApp')
    .controller('BeaconsCtrl', [ '$scope', 'SaltBeaconService', 'growl', '$modal', 'fileService', '$state', 'lodash', function($scope, SaltBeaconService, growl, $modal, fileService, $state, lodash) {

        $scope.uploadBeaconModal = {};
        $scope.noFile = true;
        $scope.beacons = [];
        $scope.beaconsDesc = 'This is description text.';
        
        $scope.beaconsChartGlobalOptions = {
            'type'      : 'AreaChart',
            'displayed' : true,
            'data'      : {
                'cols'  : [
                     {
                         'id'   : 'hours',
                         'label': 'Hours',
                         'type' : 'string',
                         'p'    : {}
                    },
                    {
                        'id'    : 'login-id',
                        'label' : 'Login',
                        'type'  : 'number',
                        'p'     : {}
                    }
                ]
            },
            'options'   : {
                'title'             : 'Login Per Hour Across System',
                'titleTextStyle'    : {'color': '#84DBF3'},
                'isStacked'         : 'false',
                'fill'              : 20,
                'colors'            : ['#84DBF3'],
                'backgroundColor'   :'#455569',
                'displayExactValues': true,
                'vAxis'             : {
                    'title'         : 'No. of Login',
                    'titleTextStyle':{'color': '#fff'},
                    'textStyle'     :{'color': '#778A9D'},
                    'gridlines'     : {
                        'count': 10
                    },
                    'ticks'         : [0, 5, 10, 15, 20, 25]
                },
                'hAxis' : {
                    'title'         : 'Hours',
                    'titleTextStyle': {'color': '#fff'},
                    'textStyle'     : {'color': '#778A9D'},
                },
                'legend': {
                    'textStyle': {'color':'#fff'},
                },
                'tooltip': {
                    'isHtml': false
                },
            },                  
            'formatters': {},
            'view': {}
        };


        /**
         * To list down the beacons in UI
         * 
         */
        $scope.selectedBeacon = {};
        $scope.beaconsList = {};

        $scope.getBeaconsAll = function() {
            SaltBeaconService.getBeaconsAll()
            .then(function(response) {
                $scope.beaconsList = response.data.data.results;
                $scope.selectedBeacon = $scope.beaconsList[0];
                if($state.is('salt.dashboard.resources.target-beacons')) {
                    $scope.getTargetBeacons();
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
                      growl.error('Unknown server error');
                  break;
              }
            });
        };

        /*
         * For Selected beacons.
         */
        $scope.setSelectedBeacon = function(beacon) {
            $scope.selectedBeacon = beacon;
        };

        /**
         * Modal for upload beacon
         */
        $scope.uploadBeaconForm = function() {
            $scope.uploadBeaconModal = $modal.open({
                templateUrl : 'views/dialogs/uploadBeacons.html',
                scope       : $scope,
                backdrop    : 'static'
            });

            //Accept
            $scope.uploadBeaconConfirm = function(beacon) {
                //Blank name not allowed
                if(!beacon || !beacon.name) {
                    return;
                }

                var file = fileService.getFile(),
                    fileNameParts = file.name.split('.');

                //Check extension
                if(fileNameParts[fileNameParts.length - 1] !== 'py') {
                    growl.error('Invalid file type.');
                    $scope.noFile = false;
                    return;
                }

                $scope.beacon = beacon;

                //Handle upload
                //TODO Use modal promise
                SaltBeaconService.uploadBeaconFile(beacon, file)
                .then(function() {
                    growl.success('Beacon uploaded successfully');
                    $scope.uploadBeaconModal.dismiss();
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
                            if(response.data.error[0] === 'name_empty') {
                                growl.error('Name of the beacon is empty');
                            } else if(response.data.error[0] === 'description_empty') {
                                growl.error('Description of the beacon is empty');
                            } else if(response.data.error[0] === 'error_uploading_file') {
                                growl.error('Unable to write file to the server');
                            } else if(response.data.error[0] === 'invalid_script') {
                                growl.error('Invalid beacon script uploaded');
                            } else if(response.data.error[0] === 'script_file_empty') {
                                growl.error('Empty script uploaded');
                            } else {
                                growl.error('Unknown server error');
                            }
                        break;
                    }
                });
            };

            //Reject
            $scope.uploadBeaconCancel = function() {
                $scope.uploadBeaconModal.dismiss();
            };
        };

        /**
         * Get beacons for a target
         */
        $scope.getTargetBeacons = function() {
            $scope.beaconsMessage = 'Loading beacons...';
            SaltBeaconService.getTargetBeacons($state.params.targetId)
            .then(function(response) {
                if(response.data.data.count > 0) {
                    $scope.beacons = response.data.data.results;
                    angular.forEach($scope.beaconsList, function(value1){
                        angular.forEach($scope.beacons, function(value2){
                            if(value1.id === value2.id){
                                value1.isChecked = true;
                            }
                        });
                    });
                } else {
                    $scope.beaconsMessage = '0 beacons for this target.';
                }
            }, function(response) {
                $scope.beaconsMessage = 'Cannot load beacons';
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
                       growl.error('Unknown server error');
                    break;
                }
            });
        };

        /**
         * Get target beacon stats
         */
        $scope.getBeaconStats = function(forTarget) {
            //URL params
            /* jshint camelcase: false*/
            var params = { type: 'wtmp' };
            
            if(forTarget) {
                params.target_id = $state.params.targetId;
            }
            
            SaltBeaconService.getTargetBeaconStats(params)
            .then(function(response) {
                if(response.data.data) {
                    var rows = [];
                    angular.forEach(response.data.data, function(val, key) {
                        rows.push({ c: [{ v: key}, { v: val, f: val + ' people logged in' }, null ] });
                    });

                    $scope.beconsLoginsPerHourChart = $scope.beaconsChartGlobalOptions;
                    $scope.beconsLoginsPerHourChart.data.rows = rows;
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
                        if(response.data.error[0] === 'difference_must_be_integer') {
                            growl.error('Interval must be an integer');
                        } else if(response.data.error[0] === 'hours_must_be_integer') {
                            growl.error('Hours must be an integer');
                        } else if(response.data.error[0] === 'target_id_must_be_integer') {
                            growl.error('Target Id must be an integer');
                        } else {
                            growl.error('Unknown server error');
                        }
                    break;
                }
            });
        };
        
        /*
         * Get Target All Beacons Events
         */
        $scope.getAllBeaconsEvent = function() {
          //URL params
            /* jshint camelcase: false*/
            var params = { target_id: $state.params.targetId };
            
            SaltBeaconService.getTargetBeaconEvents(params)
            .then(function(response) {
                $scope.targetBeaconsEvent = response.data.data;
                $scope.beaconKeys = lodash.keys($scope.targetBeaconsEvent);
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
                            growl.error('Internal server error');

                    break;
                }
            });
            
        };
        
        
        $scope.checkBoxStatusBeacons = function() {
            $scope.selectedBeacons = [];
            for(var i=0; i<$scope.beaconsList.length;i++) {
                if($scope.beaconsList[i].isChecked) {
                    var beaconId = parseInt($scope.beaconsList[i].id, 10);
                    $scope.selectedBeacons.push(beaconId);
                    }
            }
        };
        
        /**
         * Remove Beacons
         */
        $scope.confirmDeleteBeacons = function() {
            //Create
            $scope.deleteBeaconsModal = $modal.open({
                templateUrl : 'views/dialogs/confirmDeleteBeacons.html',
                scope       : $scope,
                backdrop    : 'static'
            });

            //Accept
            $scope.confirmDeleteOk = function() {
                $scope.deleteBeaconsModal.close();
            };

            //Reject
            $scope.confirmDeleteCancel = function() {
                $scope.deleteBeaconsModal.dismiss();
            };

            //Handle promise
            $scope.deleteBeaconsModal.result.then(function() {
                $scope.removeBeacons();
            }, function() {
                //Nothing
            });
            
        };
        
        $scope.removeBeacons = function() {
            console.log($scope.selectedBeacons);
            /*SaltMinionService.deleteQuickTarget()
            .then(function() {
                $state.go($state.current, {}, {reload: true});
            }); */
            
        };


        //State based function calls
        if($state.current.name === 'salt.dashboard.resources.target-beacons') {
            $scope.getBeaconsAll();
            $scope.getBeaconStats(true);
            $scope.getAllBeaconsEvent();
        } else {
            $scope.getBeaconsAll();
            $scope.getBeaconStats();
        }
    }]);
