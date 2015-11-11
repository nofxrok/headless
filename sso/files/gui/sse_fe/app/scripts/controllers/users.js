'use strict';

/**
 * @ngdoc function
 * @name sseFeApp.controller:UsersCtrl
 * @description
 * # UsersCtrl
 * Controller of the sseFeApp
 */
angular.module('sseFeApp')
    .controller('UsersCtrl', ['$scope', 'SaltUserService', 'SaltConfig', '$state', '$modal', '$log', 'lodash', 'growl', function ($scope, SaltUserService, SaltConfig, $state, $modal, $log, lodash, growl) {
        /*jshint camelcase: false */
        $scope.users = undefined;
        $scope.selectedUsers = [];
        $scope.confirmDeleteModal = {};
        $scope.currentUser = SaltConfig.getUser().username;
        $scope.previousPage = 0;
        $scope.nextPage = 0;
        $scope.showPagination = false;
        $scope.selectedAll = false;
        $scope.checkedUsers = [];

        /**
         * Get all users
         * @param {number} usersPage Page number
         */
        $scope.getUsers = function(usersPage) {
            var usersParams = {};

            //Set page number if available
            if(typeof usersPage !== 'undefined') {
                usersParams.page = usersPage;
            }

            // Get all users
            SaltUserService.getUsers(usersParams)
            .then(function(response){
                if(response.data.data.count > 0){
                    $scope.users = response.data.data.results;
                    $scope.users.forEach(function(){
                        $scope.checkedUsers.push(false);
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

                    $scope.totalPages = response.data.data.total_page_number;
                    $scope.currentPage = $scope.nextPage === 0 ? $scope.totalPages : $scope.nextPage - 1;

                    //Show pagination if required
                    if($scope.previousPage !== 0 || $scope.nextPage !== 0) {
                        $scope.showPagination = true;
                    }

                    //Set the user profile type
                    for(var i = 0; i < $scope.users.length; i++) {
                        //Set role types for users
                        if($scope.users[i].userprofile.is_user) {
                            $scope.users[i].type = 'user';
                        } else if($scope.users[i].userprofile.is_admin) {
                            $scope.users[i].type = 'admin';
                        } else {
                            $scope.users[i].type = 'superuser';
                        }
                    }
                }
                else{
                    $scope.users = [];
                }
            }, function() {
                //TODO
            });
        };

        /**
         * Get the previous page of users
         */
        $scope.getUsersPrev = function() {
            $scope.getUsers($scope.previousPage);
        };
        
        /**
         * Get the first page of users
         */
        $scope.getUsersFirst = function() {
            $scope.getUsers(1);
        };

        /**
         * Get the next page of users
         */
        $scope.getUsersNext = function() {
            $scope.getUsers($scope.nextPage);
        };

        /**
         * Get the last page of users
         */
        $scope.getUsersLast = function() {
            $scope.getUsers($scope.totalPages);
        };

        /**
         * Select all users
         */
        $scope.selectAll = function() {
            var filteredUsers = lodash.filter($scope.users, function(user) {
                return user.username !== $scope.currentUser && user.type !== 'superuser';
            });

            //Select all
            if(!$scope.selectedAll) {
                for(var i = 0; i < $scope.users.length; i++) {
                    if($scope.users[i].type !== 'superuser' && $scope.users[i].username !== $scope.currentUser) {
                        $scope.checkedUsers[i] = true;
                    }
                }
                $scope.selectedUsers = lodash.pluck(filteredUsers, 'id');
                $scope.selectedAll = true;
            }
            //Deselect all
            else {
                for(var j = 0; j < $scope.users.length; j++) {
                    if($scope.users[j].type !== 'superuser' && $scope.users[j].username !== $scope.currentUser) {
                        $scope.checkedUsers[j] = false;
                    }
                }
                $scope.selectedUsers = [];
                $scope.selectedAll = false;
            }
        };

        /**
         * Select users for deletion
         * @param {number} userId Id of the user
         */
        $scope.selectUser = function(index, userId) {
            var filteredUsers = lodash.filter($scope.users, function(user) {
                return user.username !== $scope.currentUser && user.type !== 'superuser';
            });

            $scope.checkedUsers[index] = $scope.checkedUsers[index]? false : true;
            userId = parseInt(userId, 10); //Typecast, very important!

            //Check if the user id exists
            index = lodash.indexOf($scope.selectedUsers, userId);

            //If not, add it
            if(index === -1) {
                $scope.selectedUsers.push(userId);
                if($scope.selectedUsers.length === filteredUsers.length) {
                    $scope.selectedAll = true;
                }
            }
            //Else remove it
            else {
                $scope.selectedUsers.splice(index, 1);
                $scope.selectedAll = false;
            }
        };

        /**
         * Open Delete confirmation modal
         */
        $scope.confirmDeleteUsers = function() {
            if($scope.users.length === 0) {
                growl.warning('Please add a user');
                return false;
            } else if($scope.selectedUsers.length === 0) {
                growl.warning('Please select atleast one user');
                return false; 
            }

            //Create
            $scope.confirmDeleteModal = $modal.open({
                templateUrl : 'views/dialogs/confirmDeleteUsers.html',
                scope       : $scope,
                backdrop    : 'static'
            });

            //Accept
            $scope.confirmDeleteUsersOk = function() {
                $scope.confirmDeleteModal.close();
            };

            //Reject
            $scope.confirmDeleteUsersCancel = function() {
                $scope.confirmDeleteModal.dismiss();
            };

            //Handle promise
            $scope.confirmDeleteModal.result.then(function() {
                $scope.deleteUsers();
            }, function() {
                return;
            });
        };

        /**
         * Delete selected users
         */
        $scope.deleteUsers = function() {
            var selected = {};
            for(var i = 1; i <= $scope.selectedUsers.length; i++){
                selected['u'+i] = $scope.selectedUsers[i - 1];
            }

            //Send the masters list to the server for deletion
            SaltUserService.deleteUsers(selected)
            .then(function(response) {
                if(response.status === 200) {
                    growl.success('Selected user(s) deleted');
                    $scope.selectedUsers = [];
                    $state.go($state.current, {}, {reload: true});       
                }
            }, function() {
                growl.error('Some error has occurred');
            });
        };

        /**
         * Add user
         * @param {object} user Details of the user to be added
         */
        $scope.addUser = function(user) {
            //Validations
            if(user.password !== user.confirm_password) {
                growl.error('Password and Confirm Password does not match');
                return;
            }

            //User type hardcoded for v1
            user.type = 'superuser';

            //Remove the confirm password field
            delete user.confirm_password;

            SaltUserService.addUser(user)
            .then(function() {
                growl.success('User created successfully');
                $state.go('salt.dashboard.settings.users.list', {}, { reload: true });
            }, function(response) {
                switch(response.data.error[0]) {
                    case 'unauthorized_access':
                        growl.error('Invalid credentials');
                    break;

                    case 'user_already_exists':
                        growl.error('User already exists');
                    break;

                    default:
                        growl.error('Internal Server Error');
                    break;
                }
            });
        };

        /**
         * Fetch a users details for editing
         * @param {number} userId Id of the user
         */
        $scope.showUser = function(userId) {
            SaltUserService.getUser(userId)
            .then(function(response){
                if(response.data.data.count > 0) {
                    $scope.currentUserEdited = response.data.data.results[0];
                    //Set role types for users
                    if(response.data.data.results[0].userprofile.is_user) {
                        $scope.currentUserEdited.type = 'user';
                    } else if(response.data.data.results[0].userprofile.is_admin) {
                        $scope.currentUserEdited.type = 'admin';
                    } else {
                        $scope.currentUserEdited.type = 'superuser';
                    }
                }
            }, function(response){
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
         * Edit a user
         * @param {object} user The new details
         */
        $scope.editUser = function(user) {
            SaltUserService.editUser(user)
            .then(function() {
                growl.success('Changes saved');
                $state.go('salt.dashboard.settings.users.list', {}, {reload: true});
            }, function(response) {
                switch(response.data[0]) {
                    case 'invalid_master_credentials':
                        growl.error('Invalid Master credentials');
                    break;

                    case 'no_route_to_host':
                        growl.error('Master not reachable');
                    break;
                }
            });
        };

        //Users list page
        if($state.current.name === 'salt.dashboard.settings.users.list') {
            $scope.getUsers();
        }
    }]);
