'use strict';

/**
 * @ngdoc service
 * @name sseFeApp.SaltMinionService
 * @description
 * # SaltMinionService
 * Factory in the sseFeApp.
 */
angular.module('sseFeApp')
    .factory('SaltMinionService', ['$http', '$q', 'SaltUrlService', 'SaltConfig', function($http, $q, SaltUrlService, SaltConfig) {
        /* Get all the urls for minion */
        var _urls = SaltUrlService.getUrls('minion');
        var _urlsUser = SaltUrlService.getUrls('user');

        /**
         * Public methods
         */
        return {
            /**
             * Get all the minions available
             * @param {object} params Pagination parameters
             * @return {object} $http Promise for the Ajax call
             */
            getMinions: function(params) {
                var config = {
                        method: 'get',
                        url: _urls.all,
                        params: params,
                        headers: {
                            AUTHORIZATION: 'Token ' + SaltConfig.getUser().token
                        }
                    };

                return $http(config);
            },

            /**
             * Get a target minions history
             * @param {number} target Id of the desired target
             * @param {object} params Pagination parameters
             * @return {object} $http Promise for the Ajax call
             */
            getTargetJobHistory: function(targetId, params) {
                var config = {
                        method: 'get',
                        params: params,
                        url: _urls.targetJobHistory + targetId + '/',
                        headers: { AUTHORIZATION: 'Token ' + SaltConfig.getUser().token }
                    };

                return $http(config);
            },

            /**
             * Get a minion
             * @param {number} minion Id of the desired minion
             * @return {object} $http Promise for the Ajax call
             */
            getMinion: function(minion) {
                var config = {
                        method: 'get',
                        url: _urls.one + minion + '/',
                        headers: { AUTHORIZATION: 'Token ' + SaltConfig.getUser().token }
                    };

                return $http(config);
            },
            
            /**
             * Get a minions Job details
             * @param {number} minion Id of the desired minion
             * @return {object} $http Promise for the Ajax call
             */
            getMinionJobs: function(minion) {
                var config = {
                        method: 'get',
                        url: _urls.oneJob + minion + '/',
                        headers: { AUTHORIZATION: 'Token ' + SaltConfig.getUser().token }
                    };

                return $http(config);
            },

            /**
             * Refresh minions
             * @return {object} $http Promise for the Ajax call
             */
            refreshMinions: function() {
                var config = {
                        method: 'post',
                        url: _urls.refresh,
                        headers: {
                            AUTHORIZATION: 'Token ' + SaltConfig.getUser().token
                        },
                        data: {
                            'fun': 'grains.items',
                            'client': 'local',
                            'tgt': '*'
                        }
                    };

                return $http(config);
            },

            /**
             * Add minions to the quick target
             * @param {object} minions Key value pairs to send minion ids
             * @return {object} $http Promise for the Ajax call
             */
            addToQuickTarget: function(minions) {
                var config = {
                        method: 'post',
                        url: _urls.addToQt,
                        headers: {
                            AUTHORIZATION: 'Token ' + SaltConfig.getUser().token
                        },
                        data: minions
                    };

                return $http(config);
            },

            /**
             * Get minions for a quick target
             * @param {object} params Pagination parameters
             * @return {object} $http Promise for the Ajax call
             */
            getQuickTargetMinions: function(params) {
                var config = {
                        method: 'get',
                        url: _urls.getQt,
                        params: params,
                        headers: {
                            AUTHORIZATION: 'Token ' + SaltConfig.getUser().token
                        }
                    };

                return $http(config);
            },
            
            /**
             * Get Target Group list of Minions
             * 
             */
            
            getMinionTargetGroups: function(params) {
                var config = {
                        method: 'post',
                        url:_urls.targetListAll,
                        headers: {
                            AUTHORIZATION: 'Token ' + SaltConfig.getUser().token
                        },
                        data: params,
                };
               return $http(config);
            },
            
            modifyMinionTargetGroups: function(targetList,minionList) {
                var config = {
                        method: 'post',
                        url:_urls.targetListAllMod,
                        headers: {
                            AUTHORIZATION: 'Token ' + SaltConfig.getUser().token
                        },
                        data: {targetList:targetList, minionList:minionList},
                };
                return $http(config);
            },
            
            /**
             * Add a quick target to a target
             * @param {object} target New target details
             * @return {object} $http Promise for the Ajax call
             */
            addToTarget: function(target, addSelected) {
                var config = {
                        method: 'post',
                        headers: {
                            AUTHORIZATION: 'Token ' + SaltConfig.getUser().token
                        },
                        data: target
                    };

                if(addSelected) {
                    config.url = _urls.addSelectedToT;
                } else {
                    config.url = _urls.addToT;
                }

                return $http(config);
            },

            /**
             * Delete a quick target
             * @return {object} $http Promise for the Ajax call
             */
            deleteQuickTarget: function() {
                var config = {
                        method: 'delete',
                        url: _urls.deleteQt,
                        headers: {
                            AUTHORIZATION: 'Token ' + SaltConfig.getUser().token
                        }
                    };

                return $http(config);
            },

            /**
             * Get minions for a quick target
             * @param {number} targetId Id of the target
             * @param {object} tPage Pagination parameters
             * @return {object} $http Promise for the Ajax call
             */
            getTargetMinions: function(targetId, tPage) {
                var config = {
                        method: 'get',
                        url: _urls.targetMinions + targetId +'/minions/',
                        params: tPage,
                        headers: {
                            AUTHORIZATION: 'Token ' + SaltConfig.getUser().token
                        }
                    };

                return $http(config);
            },
            
            /**
             * Get minions for a Folder
             * @param {number} folderId Id of the folder
             * @param {object} fPage Pagination parameters
             * @return {object} $http Promise for the Ajax call
             */
            getFolderMinions: function(folderId, fPage) {
                var config = {
                        method: 'get',
                        url: _urls.folderMinions + folderId +'/',
                        params: fPage,
                        headers: {
                            AUTHORIZATION: 'Token ' + SaltConfig.getUser().token
                        }
                    };

                return $http(config);
            },

            /**
             * Remove a minion from a quick target
             * @param {number} minionId Id of the minion to be removed
             * @return {object} $http Promise for the Ajax call
             */
            removeQuickTargetMinion: function(minionId) {
                var config = {
                        method: 'delete',
                        url: _urls.removeFromQt + minionId + '/delete/',
                        headers: {
                            AUTHORIZATION: 'Token ' + SaltConfig.getUser().token
                        }
                    };

                return $http(config);
            },

            deleteQuickTargetMinions: function(minions) {
                var config = {
                        method: 'post',
                        url: _urls.deleteFromQt,
                        headers: {
                            AUTHORIZATION: 'Token ' + SaltConfig.getUser().token
                        },
                        data: minions
                    };

                return $http(config);
            },

            /**
             * Delete a target or target minions
             * @param {number} targetId Id of the target
             * @return {object} $http Promise for the Ajax call
             */
            deleteTarget: function(targetId, minions) {
                var config = {
                        headers: {
                            AUTHORIZATION: 'Token ' + SaltConfig.getUser().token
                        }
                    };

                //If no minions selected, then set method as delete else post
                if(typeof minions === 'undefined') {
                    config.method = 'delete';
                    config.url = _urls.deleteTarget + targetId + '/delete/';
                } else {
                    config.method = 'post';
                    config.url = _urls.deleteTarget + targetId + '/minions/delete/';
                    config.data = minions;
                }

                return $http(config);
            },
            
            /**
             * Edit a target
             * @param {object} target New target details
             * @return {object} $http Promise for the Ajax call
             */
            editTarget: function(target) {
                /*jshint camelcase: false */
                var config = {
                        method: 'post',
                        url: _urls.editTarget + target.target_id + '/edit/' ,
                        data: target,
                        headers: {
                            AUTHORIZATION: 'Token ' + SaltConfig.getUser().token
                        },

                    };

                return $http(config);
            },

            /**
             * Get target folders structure
             * @return {object} $http Promise for the Ajax call
             */
            getTargetPublicFolderStructure: function() {
                var config = {
                        method: 'get',
                        url: _urlsUser.publicFolderAll,
                        headers: {
                            AUTHORIZATION: 'Token ' + SaltConfig.getUser().token
                        }
                    };

                return $http(config);
            },
            
            getTargetPrivateFolderStructure: function() {
                var config = {
                        method: 'get',
                        url: _urlsUser.privateFolderAll,
                        headers: {
                            AUTHORIZATION: 'Token ' + SaltConfig.getUser().token
                        }
                    };

                return $http(config);
            },
            
            /**
             * Add target folder
             * @param {object} folderData Details for the new folder
             * @return {object} $http Promise for the Ajax call
             */
            addTargetFolder: function(folderData) {
                var config = {
                        method: 'post',
                        url: _urlsUser.addFolder,
                        data: folderData,
                        headers: {
                            AUTHORIZATION: 'Token ' + SaltConfig.getUser().token
                        }
                    };

                return $http(config);
            },

            /**
             * Remove a target folder
             * @param {number} folderData Id of the folder to be deleted
             * @return {object} $http Promise for the Ajax call
             */
            removeTargetFolder: function(folderId) {
                var config = {
                        method: 'post',
                        url: _urlsUser.deleteFolder + folderId + '/',
                        headers: {
                            AUTHORIZATION: 'Token ' + SaltConfig.getUser().token
                        }
                    };

                return $http(config);
            },
            
            /**
             * Edit target folder
             * @param {object} folderData Details for the new folder
             * @return {object} $http Promise for the Ajax call
             */
            editTargetsFolder: function(editFolderData) {
                var config = {
                        method: 'post',
                        url: _urlsUser.editTargetFolder,
                        data: editFolderData,
                        headers: {
                            AUTHORIZATION: 'Token ' + SaltConfig.getUser().token
                        }
                    };

                return $http(config);
            },

            /**
             * Save a text filter
             * @param {object} filterData The parameters for the filter
             * @return {object} $http Promise for the Ajax call
             */
            saveTextFilter: function(filterData) {
                var config = {
                        method: 'post',
                        url: _urls.saveTextFilter,
                        data: filterData,
                        headers: {
                            AUTHORIZATION: 'Token ' + SaltConfig.getUser().token
                        }
                    };

                return $http(config);
            },

            /**
             * List all the exisiting filters
             * @return {object} $http Promise for the Ajax call
             */
            listFilters: function() {
                var config = {
                        method: 'get',
                        url: _urls.listFilters,
                        headers: {
                            AUTHORIZATION: 'Token ' + SaltConfig.getUser().token
                        }
                    };

                return $http(config);
            },

            /**
             * Apply text filters
             * @param {object} criteria The search parameters
             */
            applyTextFilter: function(criteria) {
                var config = {
                        method: 'get',
                        url: _urls.applyFilters,
                        params: criteria,
                        headers: {
                            AUTHORIZATION: 'Token ' + SaltConfig.getUser().token
                        }
                    };

                return $http(config);
            },

            /**
             * Get grains data
             */
            getGrainsData: function() {
                var config = {
                        method: 'get',
                        url: _urlsUser.grainsData,
                        headers: {
                            AUTHORIZATION: 'Token ' + SaltConfig.getUser().token
                        }
                    };

                return $http(config);
            },

            /**
             * Apply grains filter
             */
            applyGrainFilters: function(criteria) {
                var config = {
                        method: 'get',
                        url: _urls.applyGrainFilters,
                        params: criteria,
                        headers: {
                            AUTHORIZATION: 'Token ' + SaltConfig.getUser().token
                        }
                    };

                return $http(config);
            },

            /**
             * Save grains filter
             */
            saveGrainsFilter: function(filterData) {
                var config = {
                        method: 'post',
                        url: _urls.saveTextFilter,
                        data: filterData,
                        headers: {
                            AUTHORIZATION: 'Token ' + SaltConfig.getUser().token
                        }
                    };

                return $http(config);
            },

            /**
             * Minion Key Accept/Delete
             */
            doKeyAction: function(actionData) {
                var config = {
                        method: 'post',
                        url: _urls.keyAction,
                        data: actionData,
                        headers: {
                            AUTHORIZATION: 'Token ' + SaltConfig.getUser().token
                        }
                    };

                return $http(config);
            },

            /**
             * Get report statistics
             * @param {object} params URL parameters
             * @return {object} $http Promise for the Ajax call
             */
            getReports: function(params) {
                var config = {
                        method: 'get',
                        url: _urls.reportsAll,
                        params: params,
                        headers: {
                            AUTHORIZATION: 'Token ' + SaltConfig.getUser().token
                        }
                    };

                return $http(config);
            },

            /**
             * Get job history by minions
             * @params {object} minions Minion ids for history
             * @return {object} $http Promise for the Ajax call
             */
            getMinionsJobHistory: function(minions) {
                var config = {
                        method: 'get',
                        url: _urls.minionsJobHistory,
                        params: minions,
                        headers: {
                            AUTHORIZATION: 'Token ' + SaltConfig.getUser().token
                        }
                    };

                return $http(config);
            }
        };
    }]);
