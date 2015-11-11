'use strict';

/**
 * @ngdoc directive
 * @name sseFeApp.directive:filemodel
 * @description
 * # filemodel
 */
angular.module('sseFeApp')
  .directive('timeDatePicker', [
    '$filter', '$sce', function($filter, $sce) {
      return {
        restrict: 'AE',
        replace: true,
        scope: {
          _modelValue: '=ngModel'
        },
        require: 'ngModel',
        templateUrl: 'time-date.tpl.html',
        link: function(scope, element, attrs, ngModel) {
          var _ref;
          scope._mode = (_ref = attrs.defaultMode) !== null ? _ref : 'date';
          scope._displayMode = attrs.displayMode;
          ngModel.$render = function() {
            scope.date = ngModel.$modelValue !== null ? new Date(ngModel.$modelValue) : new Date();
            scope.calendar._year = scope.date.getFullYear();
            scope.calendar._month = scope.date.getMonth();
            /*jshint -W093 */
            return scope.clock._minutes = scope.date.getMinutes();
          };
          scope.save = function() {
            scope._modelValue = scope.date;
            return scope._modelValue;
          };
          scope.cancel = function() {
              ngModel.$render();
              return;
            };
        },
        controller: [
          '$scope', function(scope) {
            scope.date = new Date();
            scope.display = {
              title: function() {
                if (scope._mode === 'date') {
                  return $filter('date')(scope.date, 'EEEE h:mm a');
                } else {
                  return $filter('date')(scope.date, 'MMMM d yyyy');
                }
              },
              'super': function() {
                if (scope._mode === 'date') {
                  return $filter('date')(scope.date, 'MMM');
                } else {
                  return '';
                }
              },
              main: function() {
                return $sce.trustAsHtml(scope._mode === 'date' ? $filter('date')(scope.date, 'd') : '' + ($filter('date')(scope.date, 'h:mm')) + '<small>' + ($filter('date')(scope.date, 'a')) + '</small>');
              },
              sub: function() {
                if (scope._mode === 'date') {
                  return $filter('date')(scope.date, 'yyyy');
                } else {
                  return $filter('date')(scope.date, 'HH:mm');
                }
              }
            };
            scope.calendar = {
              _month: 0,
              _year: 0,
              _months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
              offsetMargin: function() {
                return '' + (new Date(this._year, this._month).getDay() * 3.6) + 'rem';
              },
              isVisible: function(d) {
                return new Date(this._year, this._month, d).getMonth() === this._month;
              },
              'class': function(d) {
                if (new Date(this._year, this._month, d).getTime() === new Date(scope.date.getTime()).setHours(0, 0, 0, 0)) {
                  return 'selected';
                } else if (new Date(this._year, this._month, d).getTime() === new Date().setHours(0, 0, 0, 0)) {
                  return 'today';
                } else {
                  return '';
                }
              },
              select: function(d) {
                return scope.date.setFullYear(this._year, this._month, d);
              },
              monthChange: function() {
                if ((this._year === null) || isNaN(this._year)) {
                  this._year = new Date().getFullYear();
                }
                scope.date.setFullYear(this._year, this._month);
                if (scope.date.getMonth() !== this._month) {
                  return scope.date.setDate(0);
                }
              }
            };
            scope.clock = {
              _minutes: 0,
              _hour: function() {
                var _h;
                _h = scope.date.getHours();
                _h = _h % 12;
                if (_h === 0) {
                  return 12;
                } else {
                  return _h;
                }
              },
              setHour: function(h) {
                if (h === 12 && this.isAM()) {
                  h = 0;
                }
                h += !this.isAM() ? 12 : 0;
                if (h === 24) {
                  h = 12;
                }
                return scope.date.setHours(h);
              },
              setAM: function(b) {
                if (b && !this.isAM()) {
                  return scope.date.setHours(scope.date.getHours() - 12);
                } else if (!b && this.isAM()) {
                  return scope.date.setHours(scope.date.getHours() + 12);
                }
              },
              isAM: function() {
                return scope.date.getHours() < 12;
              }
            };
            scope.$watch('clock._minutes', function(val) {
                scope.save();
              if ((val !== null) && val !== scope.date.getMinutes()) {
                return scope.date.setMinutes(val);
              } else {
                  scope.date = new Date();
                  scope.clock._minutes = scope.date.getMinutes();
              }
            });
            scope.setNow = function() {
                
            };
            scope._mode = 'date';
            scope.modeClass = function() {
                /* jshint eqnull:true */
              if (scope._displayMode != null) {
                scope._mode = scope._displayMode;
              }
              if (scope._displayMode === 'time') {
                return 'time-only';
              } else if (scope._displayMode === 'date') {
                return 'date-only';
              } else if (scope._mode === 'date') {
                return 'date-mode';
              } else {
                return 'time-mode';
              }
            };
            scope.setNow();
            /*jshint -W093 */
            return scope.modeSwitch = function() {
              var _ref;
              /* jshint eqnull:true */
              /*jshint -W093 */
              return scope._mode = (_ref = scope._displayMode) != null ? _ref : scope._mode === 'date' ? 'time' : 'date';
            };
          }
        ]
      };
    }
  ]);

