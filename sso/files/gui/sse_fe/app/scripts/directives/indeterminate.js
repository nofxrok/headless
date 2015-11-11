'use strict';

/**
 * @ngdoc directive
 * @name sseFeApp.directive:indeterminate
 * @description # indeterminate
 */
angular.module('sseFeApp').directive('indeterminate', [ function() {
    return {
        require : '?ngModel',
        link : function(scope, el, attrs, ctrl) {
            var firstAssign = true;
            ctrl.$formatters = [];
            ctrl.$parsers = [];
            ctrl.$render = function() {
                var d = ctrl.$viewValue;
                el.data('checked', d);
                switch (d) {
                    case true:
                        el.prop('indeterminate', false);
                        el.prop('checked', true);
                        if (firstAssign) {
                            el.prop('initialval', true);
                        }
                        break;
                    case false:
                        el.prop('indeterminate', false);
                        el.prop('checked', false);
                        if (firstAssign) {
                            el.prop('initialval', false);
                        }

                        break;
                    case null:
                        el.prop('indeterminate', true);
                        if (firstAssign) {
                            el.prop('initialval', null);
                        }
                        break;
                }

            };
            el.bind('click', function() {
                firstAssign = false;
                var d;
                switch (el.data('checked')) {
                    case true:
                        d = false;
                        break;
                    case false:
                        d = true;
                        switch (el.prop('initialval')) {
                            case null:
                                d = null;
                                break;
                        }
                        break;
                    case null:
                        d = true;
                        break;
                }

                ctrl.$setViewValue(d);
                scope.$apply(ctrl.$render);
            });
        }
    };
} ]);
