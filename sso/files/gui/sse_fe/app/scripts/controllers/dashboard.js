'use strict';

/**
 * @ngdoc function
 * @name sseFeApp.controller:DashboardCtrl
 * @description
 * # DashboardCtrl
 * Controller of the sseFeApp
 */
angular.module('sseFeApp')
    .controller('DashboardCtrl', ['$scope', '$rootScope', 'SaltAuthService', 'SaltConfig', 'SaltMasterService', 'SaltMinionService', 'SaltJobService', '$window', '$state', 'lodash', '$modal', 'growl', 'WebSockService', '$stateParams', '$modalStack', 'moment', function($scope, $rootScope, SaltAuthService, SaltConfig, SaltMasterService, SaltMinionService, SaltJobService, $window, $state, lodash, $modal, growl, WebSockService, $stateParams, $modalStack, moment) {
        //Toggle grid and list view
        $scope.mode = 1;
        $scope.confirmDeleteModal = {};
        $scope.jobReturnModal = {};
        /**
         * Log the current user out of the application
         */
        $scope.logout = function() {
            ws.send('logout');
            SaltAuthService.logout();
        };

        //Watch for display master detail event
        $scope.$on('displayMasterDetail', function() {
            $scope.currentMaster = SaltMasterService.getCurrent();
        });

        //Watch for display master detail event
        $scope.$on('editMasterDetail', function() {
            $scope.currentMasterEdit = SaltMasterService.getCurrent();
        });

        /**
         * Watch for the quick target count update event
         * @param {object} event The event object
         * @param {number} count The quick target count
         */
        $scope.$on('quickTargetCountUpdate', function(event, count) {
            $scope.quickTargetCount =  count;
        });

        /**
         * Open the help document
         */
        $scope.openHelp = function() {
            $window.open(window.location.hash ? 'help/index.html?r=' + window.location.hash.substr(1) : 'help/index.html');
        };

        //Currently logged in user's name
        $scope.username = SaltConfig.getUser().username;
        
        $scope.currentState = $state;

        $scope.targetInfo = {};
        $scope.quickTargetCount = 0;

        /**
         * Get entity counts
         */
        SaltAuthService.getTargetData()
        .then(function(response) {
            var qtIndex = lodash.findIndex(response.data.data.results, function(result){ return lodash.has(result, 'quick_target_count'); }),
                minIndex = lodash.findIndex(response.data.data.results, function(result){ return lodash.has(result, 'minion_count'); });
           /*jshint camelcase: false */
            $scope.quickTargetCount = response.data.data.results[qtIndex].quick_target_count;
            $scope.minionsCount = response.data.data.results[minIndex].minion_count;

            //Remove the quick target count node
            response.data.data.results.splice(minIndex, 1);
            response.data.data.results.splice(qtIndex, 1);

            //Set target count
            $scope.targetInfo = lodash.remove(response.data.data.results, function(target) { return target.is_user_favorite; });
            $scope.systemTargetInfo = response.data.data.results;
        });

        /**
         * Confirm target deletion modal
         * @param {number} targetId The id of the target to be deleted
         */
        $scope.confirmDeleteTarget = function(deleteTargetObj, selectedMinions) {
            $scope.targetId = deleteTargetObj;

            //Create
            $scope.confirmDeleteModal = $modal.open({
                templateUrl : 'views/dialogs/confirmDeleteTarget.html',
                scope       : $scope,
                backdrop    : 'static'
            });

            //Accept
            $scope.confirmDeleteOk = function() {
                $scope.confirmDeleteModal.close($scope.targetId);
            };

            //Reject
            $scope.confirmDeleteCancel = function() {
                $scope.confirmDeleteModal.dismiss();
            };

            if(selectedMinions.length > 0) {
                var selected = {};
                for(var i = 1; i <= selectedMinions.length; i++){
                    selected['m'+i] = selectedMinions[i - 1];
                }
            }

            //Handle promise
            $scope.confirmDeleteModal.result.then(function(response) {
                $scope.deleteTarget(response, selected);
            }, function() {
                //Nothing
            });
        };

        /**
         * Target deletion
         */
        $scope.deleteTarget = function(targetId, selectedMinions) {
            SaltMinionService.deleteTarget(targetId, selectedMinions)
            .then(function() {
                if(typeof selectedMinions === 'undefined') {
                    growl.success('Target successfully deleted.');
                    $state.go('salt.dashboard.resources.minions', {}, {reload: true});
                } else {
                    growl.success('Selected minions successfully removed from the current target.');
                    $state.go($state.current, {}, {reload: true});
                }
            }, function(response) {
                switch(response.status) {
                    case 0:
                    case 500:
                        growl.error('Server not reachable.');
                    break;

                    case 400:
                        if(response.data.error[0] === 'token_not_provided') {
                            growl.error('Token not provided.');
                        } else if(response.data.error[0] === 'target_created_by_another_user') {
                            growl.error('Can\'t delete a target created by another user.');
                        }
                    break;

                    case 401:
                        growl.error('Unauthorized access.');
                    break;

                    case 404:
                        growl.error('Invalid url.');
                    break;

                    default:
                        growl.error('Some error occurred.');
                    break;
                }
            });
        };
        
        
        /**
         * Edit target dialog
         */
        $scope.editTarget = function(editTargetObj) {
            /*jshint camelcase: false */
            //Copy the object with POST variable names
            $scope.editTargetData = { 
                target_id       : editTargetObj.id,
                old_target_name : editTargetObj.target_name,
                new_target_name : editTargetObj.target_name
            };

            //Create
            $scope.editTargetModal = $modal.open({
                templateUrl : 'views/dialogs/editTarget.html',
                scope       : $scope,
                backdrop    : 'static'
            });

            //Accept
            $scope.editTargetOk = function() {
                //Reject blank or invalid name
                if(!$scope.editTargetData.new_target_name || $scope.editTargetData.new_target_name === '') {
                    growl.error('Please enter a valid target name.');
                }

                //If the name is unchanged, dismiss the modal with no action
                else if($scope.editTargetData.new_target_name === $scope.editTargetData.old_target_name) {
                    growl.info('Target name unchanged.');
                    $scope.editTargetModal.dismiss();
                }

                //Edit
                else {
                    $scope.editTargetModal.close();
                }
            };

            //Reject
            $scope.editTargetCancel = function() {
                $scope.editTargetModal.dismiss();
            };

            //Handle promise
            $scope.editTargetModal.result.then(function() {
                $scope.editTargetService();
            }, function() {
                //Nothing
            });
        };

        /**
         * Edit target - Service call
         */
        $scope.editTargetService = function() {
            SaltMinionService.editTarget($scope.editTargetData)
            .then(function() {
                $state.go($state.current, {}, {reload: true});
                growl.info('Target edited succesfully.');
            }, function(response) {
                switch(response.status) {
                    case 0:
                    case 500:
                        growl.warning('Internal Server error');
                    break;

                    case 400:
                        if(response.data.error[0] === 'target_exists') {
                            growl.error('Target already exists.');
                        } else if(response.data.error[0] === 'target_name_empty') {
                            growl.error('Please enter a valid target name.');
                        } else if(response.data.error[0] === 'user_not_allowed_to_target') {
                            growl.error('You dont have permission to edit target');
                        } else {
                            growl.error('Bad request.');
                        }
                    break;

                    case 401:
                        growl.error('Unauthorized access.');
                    break;
                }
            });
        };
        

        var wsScheme = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
        /***
         * Web Socket connection
         */
        var ws = WebSockService.connect(wsScheme + window.location.hostname  + '/ws/'+SaltConfig.getUser().token);
        /***
         * Web socket on connection open
         */
        ws.onopen = function() {
            console.log('Succeeded to open a connection');
        };
        /***
         * Web socket on error
         */
        ws.onerror = function() {
            console.log('Failed to open a connection');
        };
        /***
         * Web socket on message
         */
        ws.onmessage = function(message) {
            console.log(message);
            //Dismiss modal, if visible
            $modalStack.dismissAll();
            switch(message.data) {
                case 'token_expired':
                    growl.warning('Your session has expired. Please log in again.');
                    $state.go('salt.login');
                break;
                case 'invalid_token':
                    growl.warning('Invalid token. Please log in again.');
                    $state.go('salt.login');
                break;
            }
        };
        /***
         * Web socket on connection close
         */
        ws.onclose = function() {
            console.log('Succeeded to close a connection');
        };

        

        $scope.status = {
            isopen: false
        };

        $scope.toggleDropdown = function($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.status.isopen = !$scope.status.isopen;
        };

        /**
         * Add target folder dialog
         */
        $scope.addTargetFolder = function(parentInfo) {
            $scope.parentInfo = parentInfo;

            //Create
            $scope.addTargetFolderModal = $modal.open({
                templateUrl : 'views/dialogs/confirmAddTargetFolder.html',
                scope       : $scope,
                backdrop    : 'static'
            });

            //Accept
            $scope.addTargetFolderOk = function(targetFolder) {
                if(!targetFolder || targetFolder === '') {
                    growl.error('Please enter a valid folder name.');
                    return;
                }
                $scope.addTargetFolderModal.close(targetFolder);
            };

            //Reject
            $scope.addTargetFolderCancel = function() {
                $scope.addTargetFolderModal.dismiss();
            };

            //Handle promise
            $scope.addTargetFolderModal.result.then(function(response) {
                /*jshint camelcase: false */
                $scope.addTargetFolderData = response;
                $scope.addTargetFolderData.parent_id = $scope.parentInfo.id;
                $scope.addTargetFolderService();
            }, function() {
                //Nothing
            });
        };

        /**
         * Add target folder - Service call
         */
        $scope.addTargetFolderService = function() {
            SaltMinionService.addTargetFolder($scope.addTargetFolderData)
            .then(function() {
                $state.go($state.current, {}, {reload: true});
                growl.info('Folder created.');
            }, function(response) {
                switch(response.status) {
                    case 0:
                    case 500:
                        growl.warning('Internal Server error');
                    break;

                    case 400:
                        if(response.data.error[0] === 'folder_name_exists') {
                            growl.error('Folder already exists.');
                        } else if(response.data.error[0] === 'folder_name_empty') {
                            growl.error('Please enter a valid folder name.');
                        } else {
                            growl.error('Bad request.');
                        }
                    break;

                    case 401:
                        growl.error('Unauthorized access.');
                    break;
                }
            });
        };

        /**
         * Remove target folder dialog
         */
        $scope.removeTargetFolder = function(folder) {
            $scope.removeTargetFolderName = folder.name;
            $scope.removeTargetFolderId = folder.id;
            //Create
            $scope.removeTargetFolderModal = $modal.open({
                templateUrl : 'views/dialogs/confirmRemoveTargetFolder.html',
                scope       : $scope,
                backdrop    : 'static'
            });

            //Accept
            $scope.removeTargetFolderOk = function() {
                $scope.removeTargetFolderModal.close();
            };

            //Reject
            $scope.removeTargetFolderCancel = function() {
                $scope.removeTargetFolderModal.dismiss();
            };

            //Handle promise
            $scope.removeTargetFolderModal.result.then(function() {
                $scope.removeTargetFolderService();
            }, function() {
                //Nothing
            });
        };

        /**
         * Remove target folder - Service call
         */
        $scope.removeTargetFolderService = function() {
            SaltMinionService.removeTargetFolder($scope.removeTargetFolderId)
            .then(function() {
                $state.go($state.current, {}, {reload: true});
                growl.success('Folder deleted.');
            }, function(response) {
                switch(response.status) {
                    case 0:
                    case 500:
                        growl.warning('Server error.');
                    break;
                    
                    case 400:
                        if(response.data.error[0] === 'folder_doesnot_exists') {
                            growl.error('Folder does not exist.');
                        } else {
                            growl.error('Some error occurred.');
                        }
                }
            });
        };
        
        
        /**
         * Edit target folder dialog
         */
        
        $scope.editTargetFolder = function(editFolder) {
            /*jshint camelcase: false */
            $scope.editFolderData = {
                folder_id: editFolder.id,
                folder_old_name: editFolder.name,
                folder_new_name: editFolder.name
            };

            //Create
            $scope.editTargetFolderModal = $modal.open({
                templateUrl : 'views/dialogs/editTargetFolder.html',
                scope       : $scope,
                backdrop    : 'static'
            });

            //Accept
            $scope.editTargetFolderOk = function() {
                if(!$scope.editFolderData.folder_new_name || $scope.editFolderData.folder_new_name === '') {
                    growl.error('Please enter a valid folder name.');
                } else if($scope.editFolderData.folder_new_name === $scope.editFolderData.folder_old_name) {
                    growl.info('Folder name unchanged.');
                    $scope.editTargetFolderModal.dismiss();
                } else {
                    $scope.editTargetFolderModal.close();
                }
            };

            //Reject
            $scope.editTargetFolderCancel = function() {
                $scope.editTargetFolderModal.dismiss();
            };

            //Handle promise
            $scope.editTargetFolderModal.result.then(function() {
                $scope.editTargetFolderService();
            }, function() {
                //Nothing
            });
        };
        
        
        /**
         * Edit target folder - Service call
         */
        $scope.editTargetFolderService = function() {
            SaltMinionService.editTargetsFolder($scope.editFolderData)
            .then(function() {
                $state.go($state.current, {}, {reload: true});
                growl.info('Folder edited succesfully.');
            }, function(response) {
                switch(response.status) {
                    case 0:
                    case 500:
                        growl.warning('Server error.');
                    break;

                    case 400:
                        if(response.data.error[0] === 'folder_name_exists') {
                            growl.error('Folder already exists.');
                        } else if(response.data.error[0] === 'folder_name_empty') {
                            growl.error('Please enter a valid folder name.');
                        } else if(response.data.error[0] === 'user_not_allowed_to_edit_folder') {
                            growl.error('You dont have permission to edit folder');
                        } else {
                            growl.error('Bad request.');
                        }
                    break;

                    case 401:
                        growl.error('Unauthorized access.');
                    break;
                }
            });
        };

        $scope.targetMarkup = '';
        $scope.processTargets = function(list) {
            $scope.targetMarkup += '<ul>';
            for(var i = 0; i < list.length; i++) {
                if(list[i].children) {
                    $scope.targetMarkup += '<li>'+list[i].name;
                    $scope.processTargets(list[i].children);
                    $scope.targetMarkup += '</li>';
                } else {
                    $scope.targetMarkup += '<li>'+list[i].name+'</li>';
                }
            }
            $scope.targetMarkup += '</ul>';
        };

        /**
         * Get target folders structure for creating target from quick target
         */
        $scope.getTargetPublicFolderStructure = function() {
            SaltMinionService.getTargetPublicFolderStructure()
                .then(function(response) {
                    $scope.targetPublicFolderStructure = response.data.results;
                }, function(response) {
                    switch(response.status) {
                        case 0:
                        case 500:
                            growl.error('Some error occurred.');
                        break;

                        case 401:
                            growl.error('Unauthorized access.');
                        break;

                        case 400:
                            growl.error('No folders available.');
                        break;
                    }
                });
        };
        
        $scope.getTargetPrivateFolderStructure = function() {
            SaltMinionService.getTargetPrivateFolderStructure()
                .then(function(response) {
                    $scope.targetPrivateFolderStructure = response.data.results;
                }, function(response) {
                    switch(response.status) {
                        case 0:
                        case 500:
                            growl.error('Some error occurred.');
                        break;

                        case 401:
                            growl.error('Unauthorized access.');
                        break;

                        case 400:
                            growl.error('No folders available.');
                        break;
                    }
                });
        };

        /**
         * Get Job folders structure.
         */
        $scope.getJobPublicFolderStructure = function() {
            SaltJobService.getJobPublicFolderStructure()
                .then(function(response) {
                    $scope.jobPublicFolderStructure = response.data.results;
                }, function(response) {
                    switch(response.status) {
                        case 0:
                        case 500:
                            growl.error('Some error occurred.');
                        break;

                        case 401:
                            growl.error('Unauthorized access.');
                        break;

                        case 400:
                            growl.error('No folders available.');
                        break;
                    }
                });
        };
        
        $scope.getJobPrivateFolderStructure = function() {
            SaltJobService.getJobPrivateFolderStructure()
                .then(function(response) {
                    $scope.jobPrivateFolderStructure = response.data.results;
                }, function(response) {
                    switch(response.status) {
                        case 0:
                        case 500:
                            growl.error('Some error occurred.');
                        break;

                        case 401:
                            growl.error('Unauthorized access.');
                        break;

                        case 400:
                            growl.error('No folders available.');
                        break;
                    }
                });
        };

        //call for get folder structure
        $scope.getTargetPublicFolderStructure();
        $scope.getTargetPrivateFolderStructure();
        $scope.getJobPublicFolderStructure();
        $scope.getJobPrivateFolderStructure();

        /**
         * Add Job folder dialog
         */
        $scope.addJobFolder = function(parentInfo) {
            $scope.parentInfo = parentInfo;

            //Create
            $scope.addJobFolderModal = $modal.open({
                templateUrl : 'views/dialogs/confirmAddJobFolder.html',
                scope       : $scope,
                backdrop    : 'static'
            });

            //Accept
            $scope.addJobFolderOk = function(jobFolder) {
                if(!jobFolder || jobFolder === '') {
                    growl.error('Please enter a valid folder name.');
                    return;
                }
                $scope.addJobFolderModal.close(jobFolder);
            };

            //Reject
            $scope.addJobFolderCancel = function() {
                $scope.addJobFolderModal.dismiss();
            };

            //Handle promise
            $scope.addJobFolderModal.result.then(function(response) {
                /*jshint camelcase: false */
                $scope.addJobFolderData = response;
                $scope.addJobFolderData.parent_id = $scope.parentInfo.id;
                $scope.addJobFolderService();
            }, function() {
                //Nothing
            });
        };

        /**
         * Add job folder - Service call
         */
        $scope.addJobFolderService = function() {
            SaltJobService.addJobFolder($scope.addJobFolderData)
            .then(function() {
                $state.go($state.current, {}, {reload: true});
                growl.info('Folder created.');
            }, function(response) {
                switch(response.status) {
                    case 0:
                    case 500:
                        growl.warning('Internal Server error');
                    break;

                    case 400:
                        if(response.data.error[0] === 'folder_name_exists') {
                            growl.error('Folder already exists.');
                        } else if(response.data.error[0] === 'folder_name_empty') {
                            growl.error('Please enter a valid folder name.');
                        } else {
                            growl.error('Bad request.');
                        }
                    break;

                    case 401:
                        growl.error('Unauthorized access.');
                    break;
                }
            });
        };

        /**
         * Remove job folder dialog
         */
        $scope.removeJobFolder = function(folder) {
            $scope.removeJobFolderName = folder.name;
            $scope.removeJobFolderId = folder.id;
            //Create
            $scope.removeJobFolderModal = $modal.open({
                templateUrl : 'views/dialogs/confirmRemoveJobFolder.html',
                scope       : $scope,
                backdrop    : 'static'
            });

            //Accept
            $scope.removeJobFolderOk = function() {
                $scope.removeJobFolderModal.close();
            };

            //Reject
            $scope.removeJobFolderCancel = function() {
                $scope.removeJobFolderModal.dismiss();
            };

            //Handle promise
            $scope.removeJobFolderModal.result.then(function() {
                $scope.removeJobFolderService();
            }, function() {
                //Nothing
            });
        };

        /**
         * Remove job folder - Service call
         */
        $scope.removeJobFolderService = function() {
            SaltJobService.removeJobFolder($scope.removeJobFolderId)
            .then(function() {
                $state.go($state.current, {}, {reload: true});
                growl.success('Folder deleted.');
            }, function(response) {
                switch(response.status) {
                    case 0:
                    case 500:
                        growl.warning('Server error.');
                    break;
                    
                    case 400:
                        if(response.data.error[0] === 'folder_doesnot_exists') {
                            growl.error('Folder does not exist.');
                        } else {
                            growl.error('Some error occurred.');
                        }
                }
            });
        };
        
        
        /**
         * Edit job folder dialog
         */
        
        $scope.editJobFolder = function(editFolder) {
            /*jshint camelcase: false */
            $scope.editFolderData = {
                folder_id: editFolder.id,
                folder_old_name: editFolder.name,
                folder_new_name: editFolder.name
            };

            //Create
            $scope.editJobFolderModal = $modal.open({
                templateUrl : 'views/dialogs/editJobFolder.html',
                scope       : $scope,
                backdrop    : 'static'
            });

            //Accept
            $scope.editJobFolderOk = function() {
                if(!$scope.editFolderData.folder_new_name || $scope.editFolderData.folder_new_name === '') {
                    growl.error('Please enter a valid folder name.');
                } else if($scope.editFolderData.folder_new_name === $scope.editFolderData.folder_old_name) {
                    growl.info('Folder name unchanged.');
                    $scope.editJobFolderModal.dismiss();
                } else {
                    $scope.editJobFolderModal.close();
                }
            };

            //Reject
            $scope.editJobFolderCancel = function() {
                $scope.editJobFolderModal.dismiss();
            };

            //Handle promise
            $scope.editJobFolderModal.result.then(function() {
                $scope.editJobFolderService();
            }, function() {
                //Nothing
            });
        };
        
        /**
         * Edit job folder - Service call
         */
        $scope.editJobFolderService = function() {
            SaltJobService.editJobFolder($scope.editFolderData)
            .then(function() {
                $state.go($state.current, {}, {reload: true});
                growl.info('Folder edited succesfully.');
            }, function(response) {
                switch(response.status) {
                    case 0:
                    case 500:
                        growl.warning('Server error.');
                    break;

                    case 400:
                        if(response.data.error[0] === 'folder_name_exists') {
                            growl.error('Folder already exists.');
                        } else if(response.data.error[0] === 'folder_name_empty') {
                            growl.error('Please enter a valid folder name.');
                        } else if(response.data.error[0] === 'user_not_allowed_to_edit_folder') {
                            growl.error('You dont have permission to edit folder');
                        } else {
                            growl.error('Bad request.');
                        }
                    break;

                    case 401:
                        growl.error('Unauthorized access.');
                    break;
                }
            });
        };

        /**
         * Remove job - Dialog
         * @param {object} job  Object of the job to be deleted
         */
        $scope.confirmDeleteJob = function(job) {
            $scope.removeJobName = job.name;
            $scope.removeJobId = job.id;
            //Create
            $scope.removeJobModal = $modal.open({
                templateUrl : 'views/dialogs/confirmRemoveJob.html',
                scope       : $scope,
                backdrop    : 'static'
            });

            //Accept
            $scope.removeJobOk = function() {
                $scope.removeJobModal.close();
            };

            //Reject
            $scope.removeJobCancel = function() {
                $scope.removeJobModal.dismiss();
            };

            //Handle promise
            $scope.removeJobModal.result.then(function() {
                $scope.removeJobService();
            }, function() {
                //Nothing
            });
        };

        /**
         * Remove job - Service call
         */
        $scope.removeJobService = function() {
            SaltJobService.removeJob($scope.removeJobId)
            .then(function() {
                $state.go('salt.dashboard.jobs.list', {}, {reload: true});
                growl.success('Folder deleted.');
            }, function(response) {
                switch(response.status) {
                    case 0:
                    case 500:
                        growl.warning('Server error.');
                    break;

                    case 400:
                        if(response.data.error[0] === 'job_doesnot_exists') {
                            growl.error('Job does not exist.');
                        } else {
                            growl.error('Some error occurred.');
                        }
                    break;
                }
            });
        };

        /*
         * Open Job Schedular
         */
        
        $scope.openJobSchedular = function(selectdJob) {
            // Job 
            /*jshint camelcase: false */
            $scope.job = selectdJob;
            $scope.job.startDate = '';
            $scope.job.execute = 'now';
            $scope.job.runOnce = 'runonce';
            $scope.job.retry_option = 'retry_count';
            $scope.job.retry_count = 1;
            $scope.job.endDate = '';
            $scope.job.run_type = 'run';
            $scope.job.action_on_error = 'ignore';
            $scope.job.priority = 'none';
            $scope.job.mailOn = 'none';
            $scope.job.userIds = [];
            $scope.job.userNames = [];
            $scope.job.selectedUser = '';
            $scope.job.execute_at = '';
            $scope.job.end_after = '';
            $scope.job.minions = $scope.objectifyArray($rootScope.selectedMinions, 'm');
            $scope.job.notification = [];
            $scope.selectedUser = '';
            $scope.job.target = '';

            //Create
            $scope.openJobSchedularModal = $modal.open({
                templateUrl : 'views/dialogs/jobScheduler.html',
                scope       : $scope,
                windowClass: 'top-modal',
                backdrop    : 'static'
            });

            //Accept
            $scope.jobSchedularModalOk = function() {
                var jobDate = $scope.convertDate($scope.job.startDate);
                var jobTime = $scope.convertTime($scope.job.startDate);
                $scope.job.execute_at = jobDate + jobTime;

                if($scope.job.endDate !== undefined) {
                    var jobEndDate = $scope.convertDate($scope.job.endDate);
                    var jobEndTime = $scope.convertTime($scope.job.endDate);
                    $scope.job.end_after = jobEndDate + jobEndTime;
                }

                if($scope.job.runOnce === 'runonce') {
                    $scope.job.retry_option = null;
                    $scope.job.retry_count = null;
                    $scope.job.end_after = null;
                }

                if($state.current.name ==='salt.dashboard.resources.targets'){
                	$scope.job.target = $stateParams.targetId;
                }
                $scope.scheduleJobService();
                $scope.openJobSchedularModal.close();
            };

            //Reject
            $scope.jobSchedularModalCancel = function() {
                $scope.openJobSchedularModal.dismiss();
            };
        };

        /**
         * Job Schedule service call SaltJobService
         */
        $scope.scheduleJobService = function() {
            //If scheduling on a target, add the target ID
            if($state.current.name ==='salt.dashboard.resources.targets') {
                $scope.job.target = $state.params.targetId;
            }

            SaltJobService.scheduleJob($scope.job)
            .then(function() {
                growl.info('Job Scheduled succesfully.');
            }, function(response) {
                switch(response.status) {
                    case 0:
                    case 500:
                        growl.warning('Internal Server Error.');
                    break;

                    case 400:
                        if(response.data.error[0] === 'Select a valid choice') {
                            growl.error('Select a valid choice.');
                        } else {
                            growl.error('Bad request.');
                        }
                    break;

                    case 401:
                        growl.error('Unauthorized access.');
                    break;
                }
            });
        };

        /**
         * Convert a list to an object with the same key having ascending integers appended
         * @param {arrayObject} itemsArray The list of the items
         * @param {string} keyAlphabet 
         */
        $scope.objectifyArray = function(itemsArray, keyAlphabet) {
        	if($state.current.name ==='salt.dashboard.resources.targets'){
        		return;
        	}
        	
            var itemsObject = {};
            for(var i = 1; i <= itemsArray.length; i++){
                itemsObject[keyAlphabet+i] = itemsArray[i - 1];
            }

            return itemsObject;
        };

        // Date Conversion 
        $scope.convertDate = function(date) {
            // GET YYYY, MM AND DD FROM THE DATE OBJECT
            var yyyy = date.getFullYear().toString();
            var mm = (date.getMonth()+1).toString();
            var dd  = date.getDate().toString();
            // CONVERT mm AND dd INTO chars
            var mmChars = mm.split('');
            var ddChars = dd.split('');
            // CONCAT THE STRINGS IN YYYY-MM-DD FORMAT
            var datestring = yyyy + '-' + (mmChars[1]?mm:'0'+mmChars[0]) + '-' + (ddChars[1]?dd:'0'+ddChars[0]) + ' ';
            return datestring;
        };

        $scope.convertTime = function(date) {
            var newTime = date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1');
            return newTime;
        };

        /**
         * Select users for mailing operations
         *
         **/
        $scope.selectUser = function(user) {
            var userId = parseInt(user.id, 10); //Typecast, very important!
            var userName = user.name;

            //Check if the user name exists
            var index = lodash.indexOf($scope.job.userIds, userId);
            //If not, add it
            if(index === -1) {
                $scope.job.notification.push(userId);
                $scope.job.userNames.push(userName);
                }
        //Else remove it
            else {
                $scope.job.notification.splice(index, 1);
                $scope.job.userNames.splice(index, 1);
            }
            $scope.selectedUser = $scope.job.userNames.toString();
        };

        /**
         * For Calender Date
         */
        $scope.setDate = function() {
            $scope.date = new Date();
            return $scope.date;
        };
        $scope.setDate();

        /**
         * For Show Job Details.
         */
        $scope.showJobDetails = function() {
            console.log('show job details');
        };

        /**
         * Disable past selection
		 * @param {string} $view Current view in the calender
		 * @param {object} $dates The list of items being displayed in the current view
         */
        $scope.disablePast = function($view, $dates) {
            /*jshint -W030 */
            var today = moment(),
                todayUTC = moment.utc(),
                date = 0,
                dateUTC = 0,
                dateUTCHour = 0,
                difference = 0,
                i = 0;

            //Disable days before today
            if($view === 'day') {
                for(i = 0; i < $dates.length; i++) {
                    /*jshint -W030 */
                    date    = moment($dates[i].dateValue);

                    //Find the difference between current and displayed day
                    if(today.diff(date, 'days') > 0) {
                        $dates[i].selectable = false;
                    }
                }
            }
            //Disable months before current
            else if($view === 'month') {
                for(i = 0; i < $dates.length; i++) {
                    /*jshint -W030 */
                    date    = moment($dates[i].dateValue);

                    //Find the difference between current and displayed month
                    if(today.diff(date, 'months') > 0) {
                        $dates[i].selectable = false;
                    }
                }
            }
            //Disable years before current
            else if($view === 'year') {
                for(i = 0; i < $dates.length; i++) {
                    /*jshint -W030 */
                    date    = moment($dates[i].dateValue);

                    //Find the difference between current and displayed year
                    if(today.diff(date, 'years') > 0) {
                        $dates[i].selectable = false;
                    }
                }
            }
            //Disable hours before current hour
            else if($view === 'hour') {
                for(i = 0; i < $dates.length; i++) {
                    /*jshint -W030 */
                    todayUTC = moment.utc(),
                    dateUTC = moment.utc($dates[i].dateValue),
                    dateUTCHour = dateUTC.hour(),
                    difference = todayUTC.startOf('day').diff(dateUTC.startOf('day'));

                    //Enable for today after the current hour and tomorrow, disable for yesterday
                    if(difference === 0) {
                        if(dateUTCHour >= today.hour()) {
                            $dates[i].selectable = true;
                        } else {
                            $dates[i].selectable = false;
                        }
                    } else if(difference > 0) {
                        $dates[i].selectable = false;
                    }
                }
            } else {
                for(i = 0; i < $dates.length; i++) {
                    /*jshint -W030 */
                    date = moment.utc($dates[i].dateValue);
                    todayUTC = moment.utc(),
                    dateUTC = moment.utc($dates[i].dateValue),
                    dateUTCHour = dateUTC.hour(),
                    difference = todayUTC.startOf('day').diff(dateUTC.startOf('day'));

                    //For days greater than today
                    if(difference === 0) {
                        //For hours greater than current
                        if(dateUTCHour === today.hour()) {
                            //For minutes greater than current
                            if(date.minutes() < today.minutes()) {
                                $dates[i].selectable = false;
                            }
                        } else if(dateUTCHour < today.hour()) {
                            $dates[i].selectable = false;
                        }
                    } else if(difference > 0) {
                        $dates[i].selectable = false;
                    }
                }
            }
        };

        /**
         * Show full job return in a modal
         * @param {object} fullReturn The full return data
         */
        $scope.showJobReturnModal = function(fullReturn) {
            //Scope variable for use in the modal template
            $scope.fullReturn = JSON.stringify(fullReturn, null, 4);

            //Open the modal
            $scope.jobReturnModal = $modal.open({
                templateUrl : 'views/dialogs/jobReturns.html',
                scope       : $scope,
                backdrop    : 'static',
                resolve: {
                    fullReturn: function() {
                        return $scope.fullReturn;
                    }
                }
            });

            //Close the modal
            $scope.jobReturnModalClose = function() {
                $scope.jobReturnModal.dismiss();
            };
        };
    }])

    /**
     * Replace null or blank values with N/A
     */
    .filter('displayDefault', function() {
        return function(val) {
            if(!val || val === null || val === '') {
                val = 'N/A';
            }
            return val;
        };
    });
