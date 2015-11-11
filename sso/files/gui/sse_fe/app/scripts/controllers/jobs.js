'use strict';

/**
 * @ngdoc function
 * @name sseFeApp.controller:JobsCtrl
 * @description
 * # JobsCtrl
 * Controller of the sseFeApp
 */
angular.module('sseFeApp')
  .controller('JobsCtrl', ['$scope','$timeout', '$state', '$stateParams', 'lodash', '$modal', 'growl', 'SaltJobService', 'fileService', function($scope, $timeout, $state, $stateParams, lodash, $modal, growl, SaltJobService, fileService) {

      /*jshint camelcase: false */
      $scope.uploadSLSModal = {};
      $scope.noFile = true;
      $scope.job = [];
      $scope.job.is_fav = true;
      $scope.jobFile = null;
      $scope.jobs = [];
      $scope.slsFileContent = {};
      $scope.slsJobHistory = [];
      $scope.fileSelected = false;

      /**
       * Set file selection flag, to enable the upload button 
       */
      $scope.fileSelect = function() {
          if(typeof fileService.getFile() === 'object') {
              $scope.fileSelected = true;
          } else {
              $scope.fileSelected = false;
          }
      };

      /**
       * Upload SLS file
       */
      $scope.openUploadSLSDialog = function() {
          //Open Upload SLS dialog.
          $scope.job.name = '';
          $scope.job.foldername = $scope.jobPrivateFolderStructure[0].name;
          $scope.job.parent_id = $scope.jobPrivateFolderStructure[0].id;
          $scope.job.is_fav = true;
          $scope.job.file_type = 'state';
          $scope.uploadSLSModal = $modal.open({
              templateUrl : 'views/dialogs/uploadSLSFile.html',
              scope       : $scope,
              backdrop    : 'static'
          });

          //Change on radio button selection
          $scope.radioBtnChange = function(boolean) {
               if(boolean) {
                   $scope.job.foldername = $scope.jobPrivateFolderStructure[0].name;
                   $scope.job.parent_id = $scope.jobPrivateFolderStructure[0].id;
               } else {
                   $scope.job.foldername = $scope.jobPublicFolderStructure[0].name;
                   $scope.job.parent_id = $scope.jobPublicFolderStructure[0].id;
               }
           };

           //Accept
            $scope.uploadSLSConfirm = function(job) {
               //Blank name not allowed
               if(!job || !job.name) {
                   return;
               }

               var params = { name: job.name, is_user_favorite:true, parent_id: job.parent_id };
               if(job.is_fav) {
                   params.is_user_favorite = false;
               }

               var file = fileService.getFile(),
               fileNameParts = file.name.split('.');

               //Check extension
               if(fileNameParts[fileNameParts.length - 1] !== 'sls') {
               growl.error('Invalid file type.');
               return;
           }
               $scope.slsFileContent = file;
               $scope.job = job;
               SaltJobService.addSLSFile(job, file)
               .then(function(response) {
                   //Close modal
                   $scope.uploadSLSModal.close();
                   if(response.status === 200) {
                       growl.success('SLS file uploaded successfully.');
                       $state.go($state.current, {}, {reload: true});
                   }
               }, function(response) {
                   //Dismiss modal
                   $scope.uploadSLSModal.dismiss();
                   if(response.status === 400) {
                       switch(response.data.error[0]) {
                           case 'name_empty':
                               growl.error('SLS file name is not provided.');
                           break;

                           case 'parent_folder_id_empty':
                               growl.error('Folder is not selected.');
                           break;

                           case 'sls_file_empty':
                               growl.error('SLS file not selected.');
                           break;

                           case 'description_empty':
                               growl.error('Description is not provided.');
                           break;

                           case 'error_uploading_file':
                               growl.error('Internal server error.');
                           break;

                           case 'duplicate_sls_file':
                               growl.error('A file with same name already exists.');
                           break;

                       }
                   }
               });
           };
       };

       //Reject
       $scope.uploadSLSCancel = function() {
           $scope.uploadSLSModal.dismiss();
       };

       /**
        * Get all jobs
        */
       $scope.getJobs = function() {
           SaltJobService.getJobs()
           .then(function(response) {
               if(response.data.results.length > 0) {
                   $scope.jobs = response.data.results;
               }
           }, function() {
               //TODO
           });
       };

       /**
        * Get jobs for a particular folder
        */
       $scope.getJobsForFolder = function() {
           SaltJobService.getJobsForFolder($state.params.folderId)
           .then(function(response) {
               $scope.jobs = response.data.results;
           }, function(response) {
               switch(response.status) {
                   case 0:
                   case 500:
                       growl.error('Unknown server error');
                   break;

                   case 404:
                       growl.error('Invalid URL');
                   break;

                   case 401:
                       growl.error('Unauthorized access');
                   break;

                   case 400:
                       growl.error('Unknown error');
                   break;
               }
           });
       };

       /**
        * Select job by id
        */
       $scope.selectJob = function(jobId) {
           if($state.current.name === 'salt.dashboard.jobs.list' || $state.current.name === 'salt.dashboard.jobs.list.detail') {
               $state.go('salt.dashboard.jobs.detail', { jobId: jobId });
           } else if($state.current.name === 'salt.dashboard.jobs.folder' || $state.current.name === 'salt.dashboard.jobs.folder.detail') {
               $state.go('salt.dashboard.jobs.detail', { jobId: jobId });
           }
       };

       /**
        * Get SLS contents
        */
       $scope.getJobSls = function() {
           var job = $state.params.jobId;
           SaltJobService.getJobSls(job)
           .then(function(response) {
               $scope.fileContent = response.data.data;
           }, function(response) {
               switch(response.status) {
                   case 0:
                   case 500:
                       growl.error('Unknown server error');
                   break;

                   case 404:
                       growl.error('Invalid URL');
                   break;

                   case 401:
                       growl.error('Unauthorized access');
                   break;

                   case 400:
                       //(permission_denied, invalid_sls, file_doesnot_exists
                       if(response.data.error[0] === 'permission_denied') {
                           growl.error('Access denied');
                       } else if(response.data.error[0] === 'invalid_sls') {
                           growl.error('Invalid file');
                       } else if(response.data.error[0] === 'file_doesnot_exists') {
                           growl.error('File does not exist');
                       } else {
                           growl.error('Unknown error');
                       }
                   break;
               }
           });
       };

       /**
        * Get SLS Execution History
        */
       $scope.getJobSlsHistory = function() {
           $scope.loadingMessage = 'Please wait...';
           SaltJobService.getJobSlsHistory($state.params.jobId)
           .then(function(response) {
               if(response.data.data.count > 0) {
                   $scope.slsJobHistory = response.data.data.results;
               } else {
                   $scope.loadingMessage = 'No job history for this SLS file.';
               }
           }, function(response) {
               switch(response.status) {
                   case 0:
                   case 500:
                       growl.error('Unknown server error');
                   break;

                   case 404:
                       growl.error('Invalid URL');
                   break;

                   case 401:
                       growl.error('Unauthorized access');
                   break;

                   case 400:
                       growl.error('Unknown error');
                   break;
               }
               $state.go('salt.dashboard.jobs.list');
           });
       };

       //Call function based on the URLs/States
       if($state.current.name === 'salt.dashboard.jobs.list' || $state.current.name === 'salt.dashboard.jobs.list.detail') {
           $scope.getJobs();
       } else if($state.current.name === 'salt.dashboard.jobs.folder' || $state.current.name === 'salt.dashboard.jobs.folder.detail') {
           $scope.getJobsForFolder();
       } else if($state.current.name === 'salt.dashboard.jobs.detail') {
           $scope.getJobSls();
       } else if($state.current.name === 'salt.dashboard.jobs.sls-job-history') {
           $scope.getJobSlsHistory();
       }
  }]);