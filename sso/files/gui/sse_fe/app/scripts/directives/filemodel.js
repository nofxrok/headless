'use strict';

/**
 * @ngdoc directive
 * @name sseFeApp.directive:filemodel
 * @description
 * # filemodel
 */
angular.module('sseFeApp')
  .directive('fileModel', function (fileService) {
    return function (scope, element) {
        element.bind('change', function () {
            scope.noFile = false;
            fileService.setFile(element[0].files[0]);
        });
    };
});
