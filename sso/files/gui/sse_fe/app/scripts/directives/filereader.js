'use strict';

/**
 * @ngdoc directive
 * @name sseFeApp.directive:filemodel
 * @description
 * # filemodel
 */
angular.module('sseFeApp')
  .directive('onReadFile', function ($parse) {
    return {
        restrict: 'AE',
        replace: true,
        scope: {
          _modelValue: '=ngModel'
        },
        link: function(scope, element, attrs) {
            var fn = $parse(attrs.onReadFile);

                var reader = new FileReader();
                
                reader.onload = function(onLoadEvent) {
                    scope.$apply(function() {
                        fn(scope, {$fileContent:onLoadEvent.target.result});
                    });
                };
                //console.log(scope.$parent.slsFileContent);
                //reader.readAsText((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
                //.reader.readAsText(scope.$parent.slsFileContent);

        }
    };
});
