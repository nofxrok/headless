'use strict';

/**
 * @ngdoc directive
 * @name sseFeApp.directive:autoheightlist
 * @description
 * # autoheightlist 
 */
angular.module('sseFeApp')
  .directive('autoheightlist', function () {
    return {
      restrict: 'AE',
      link: function postLink(scope, $element) {
          scope.$watch('[filterView,filtersDisplayed,showText,showGrains]',function(){
              if(scope.filterView) {
                  $element.addClass('overflow-filter-selected');
                  if(scope.filtersDisplayed) {
                      if(scope.showText) {
                          $element.removeClass('overflow-class');
                          $element.removeClass('overflow-filter-selected');
                          $element.removeClass('overflow-grain-filter');
                          $element.addClass('overflow-text-filter');
                      } else if(scope.showGrains) {
                          $element.removeClass('overflow-class');
                          $element.removeClass('overflow-filter-selected');
                          $element.removeClass('overflow-text-filter');
                          $element.addClass('overflow-grain-filter');
                      }
                  }
              } else {
                  $element.removeClass('overflow-filter-selected');
                  $element.removeClass('overflow-grain-filter');
                  $element.removeClass('overflow-text-filter');
                  $element.addClass('overflow-class');
              }
          });
      }
    };
  });
