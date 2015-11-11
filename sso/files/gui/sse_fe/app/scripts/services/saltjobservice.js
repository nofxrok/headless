'use strict';

/**
 * @ngdoc service
 * @name sseFeApp.SaltMinionService
 * @description
 * # SaltMinionService
 * Factory in the sseFeApp.
 */
angular.module('sseFeApp')
    .factory('SaltJobService', ['$http', '$q', 'SaltUrlService', 'SaltConfig', function($http, $q, SaltUrlService, SaltConfig) {
        /* Get all the urls for minion */
        var _urls = SaltUrlService.getUrls('job');

        /**
         * Public methods
         */
        return {
            /**
             * Get job folders structure
             * @return {object} $http Promise for the Ajax call
             */
            getJobPublicFolderStructure: function() {
                var config = {
                        method: 'get',
                        url: _urls.publicFolderAll,
                        headers: {
                            AUTHORIZATION : 'Token '+SaltConfig.getUser().token
                        }
                    };

                return $http(config);
            },

            getJobPrivateFolderStructure: function() {
                var config = {
                        method: 'get',
                        url: _urls.privateFolderAll,
                        headers: {
                            AUTHORIZATION : 'Token '+SaltConfig.getUser().token
                        }
                    };

                return $http(config);
            },

            /**
             * Add SLS file to folder
             * @param {object} folderData Details for the new folder
             * @return {object} $http Promise for the Ajax call
             */
            addSLSFile: function(job, file) {
                /*jshint camelcase: false */
                var config = {
                        method: 'POST',
                        url: _urls.slsUpload,
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            AUTHORIZATION : 'Token '+SaltConfig.getUser().token,
                        },
                        data: {
                            name: job.name,
                            file_type:job.file_type,
                            description: job.is_user_favorite,
                            parent_folder_id : job.parent_id,
                            sls_file: file
                        },
                        transformRequest: function (data, headersGetter) {
                            var formData = new FormData();
                            angular.forEach(data, function (value, key) {
                                formData.append(key, value);
                            });

                            var headers = headersGetter();
                            delete headers['Content-Type'];

                            return formData;
                        }
                    };
                return $http(config);
            },

            getJobs: function(params) {
                var config = {
                        method: 'get',
                        url: _urls.all,
                        params: params,
                        headers: {
                            AUTHORIZATION : 'Token '+SaltConfig.getUser().token
                        }
                    };

                return $http(config);
            },

            getJobsForFolder: function(folderId) {
                var config = {
                        method: 'get',
                        url: _urls.all + folderId + '/',
                        headers: {
                            AUTHORIZATION : 'Token '+SaltConfig.getUser().token
                        }
                    };

                return $http(config);
            },

            /**
             * Add job folder
             * @param {object} folderData Details for the new folder
             * @return {object} $http Promise for the Ajax call
             */
            addJobFolder: function(folderData) {
                var config = {
                        method: 'post',
                        url: _urls.addFolder,
                        data: folderData,
                        headers: {
                            AUTHORIZATION : 'Token '+SaltConfig.getUser().token
                        }
                    };

                return $http(config);
            },

            /**
             * Remove a job folder
             * @param {number} folderData Id of the folder to be deleted
             * @return {object} $http Promise for the Ajax call
             */
            removeJobFolder: function(folderId) {
                var config = {
                        method: 'post',
                        url: _urls.deleteFolder + folderId + '/',
                        headers: {
                            AUTHORIZATION : 'Token '+SaltConfig.getUser().token
                        }
                    };

                return $http(config);
            },

            /**
             * Remove a job
             * @param {number} job Id of the job to be deleted
             * @return {object} $http Promise for the Ajax call
             */
            removeJob: function(jobId) {
                var config = {
                        method: 'post',
                        url: _urls.deleteJob + jobId + '/',
                        headers: {
                            AUTHORIZATION : 'Token '+SaltConfig.getUser().token
                        }
                    };

                return $http(config);
            },


            /**
             * Edit job folder
             * @param {object} folderData Details for the new folder
             * @return {object} $http Promise for the Ajax call
             */
            editJobFolder: function(editFolderData) {
                var config = {
                        method: 'post',
                        url: _urls.editjobFolder,
                        data: editFolderData,
                        headers: {
                            AUTHORIZATION : 'Token '+SaltConfig.getUser().token
                        }
                    };

                return $http(config);
            },

            /**
             * Schedule job for minions or a target
             * @param {object} job The job data
             * @return {object} $http Promise for the Ajax call
             */
            scheduleJob: function(job) {
                var config = {
                        method: 'POST',
                        url: _urls.scheduleJob +job.id + '/',
                        headers: {
                            AUTHORIZATION : 'Token '+SaltConfig.getUser().token,
                        },
                        data: {
                            /*jshint camelcase: false */
                            execute: job.execute,
                            execute_at: job.execute_at,
                            retry_option: job.retry_option,
                            retry_count: job.retry_count,
                            end_after: job.end_after,
                            run_type: job.run_type,
                            action_on_error: job.action_on_error,
                            priority: job.priority,
                            notification: job.notification,
                            minions: job.minions
                        }
                    };

                //Add the target id if executing for a target
                if(typeof job.target !== 'undefined' && job.target !== '') {
                    config.url += 'target/' + job.target + '/';                 
                }

                return $http(config);
            },

            /**
             * Get Job SLS file
             * @param {number} jobId The Job ID
             * @return {object} $http Promise for the Ajax call
             */
            getJobSls: function(jobId) {
                var config = {
                        method: 'get',
                        url: _urls.jobSls + jobId + '/',
                        responseType: 'text',
                        headers: {
                            AUTHORIZATION : 'Token '+SaltConfig.getUser().token
                        }
                    };

                return $http(config);
            },

            /**
             * Get Job SLS Execution History
             * @param {number} jobId The Job ID
             * @return {object} $http Promise for the Ajax call
             */
            getJobSlsHistory: function(jobId) {
                var config = {
                        method: 'get',
                        url: _urls.jobSlsHistory + jobId + '/',
                        headers: {
                            AUTHORIZATION : 'Token '+SaltConfig.getUser().token
                        }
                    };

                return $http(config);
            }
        };
    }]);
