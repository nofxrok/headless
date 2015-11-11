'use strict';

/**
 * @ngdoc service
 * @name sseFeApp.Fileservice
 * @description
 * # Fileservice
 * Service in the sseFeApp.
 */
angular.module('sseFeApp')
  .service('fileService', function () {
      var file;
      var fileService = {};
      fileService.getFile = function () {
          return file;
      };
      fileService.setFile = function (newFile) {
          file = newFile;
      };
      return fileService;
  });
