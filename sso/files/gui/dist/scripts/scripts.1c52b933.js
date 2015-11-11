'use strict';

/**
 * @ngdoc SaltStack Enterprise Frontend
 * @name sseFeApp
 * @description
 * # sseFeApp
 *
 * Main module of the application. 
 */
angular
    .module('sseFeApp', [
                         'ngAnimate',
                         'ngCookies',
                         'ngResource',
                         'ngSanitize',
                         'ngTouch',
                         'ui.router',
                         'ngLodash',
                         'angular-growl',
                         'mgcrea.ngStrap.tooltip',
                         'mgcrea.ngStrap.popover',
                         'ui.bootstrap.transition',
                         'ui.bootstrap.collapse',
                         'ui.bootstrap.accordion',
                         'ui.bootstrap.alert',
                         'ui.bootstrap.bindHtml',
                         'ui.bootstrap.buttons',
                         'ui.bootstrap.carousel',
                         'ui.bootstrap.dateparser',
                         'ui.bootstrap.position',
                         'ui.bootstrap.datepicker',
                         'ui.bootstrap.dropdown',
                         'ui.bootstrap.modal',
                         'ui.bootstrap.pagination',
                         'ui.bootstrap.progressbar',
                         'ui.bootstrap.rating',
                         'ui.bootstrap.tabs',
                         'ui.bootstrap.timepicker',
                         'ui.bootstrap.typeahead',
                         'template/accordion/accordion-group.html',
                         'template/accordion/accordion.html',
                         'template/alert/alert.html',
                         'template/carousel/carousel.html',
                         'template/carousel/slide.html',
                         'template/datepicker/datepicker.html',
                         'template/datepicker/day.html',
                         'template/datepicker/month.html',
                         'template/datepicker/popup.html',
                         'template/datepicker/year.html',
                         'template/modal/backdrop.html',
                         'template/modal/window.html',
                         'template/pagination/pager.html',
                         'template/pagination/pagination.html',
                         'template/tooltip/tooltip-html-unsafe-popup.html',
                         'template/tooltip/tooltip-popup.html',
                         'template/popover/popover.html',
                         'template/progressbar/bar.html',
                         'template/progressbar/progress.html',
                         'template/progressbar/progressbar.html',
                         'template/rating/rating.html',
                         'template/tabs/tab.html',
                         'template/tabs/tabset.html',
                         'template/timepicker/timepicker.html',
                         'template/typeahead/typeahead-match.html',
                         'template/typeahead/typeahead-popup.html',
                         'nsPopover',
                         'ui.bootstrap.datetimepicker',
                         'googlechart'
    ])

    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            //Root
            .state('salt', {
                url: '/',
                abstract: true,
                template: '<ui-view/>'
            })
            /*********/
            // Login
            .state('salt.login', {
                url: 'login',
                templateUrl: 'views/login.html',
                controller: 'LoginCtrl'
            })

            // Dashboard
            .state('salt.dashboard', {
                url: 'dashboard',
                templateUrl: 'views/dashboard.html',
                controller: 'DashboardCtrl'
            })

            /*********/
            // Dashboard > Resources
            .state('salt.dashboard.resources', {
                url: '/resources',
                templateUrl: 'views/tabs/resources.html',
                data: {pageTitle : ''}
            })

            .state('salt.dashboard.resources.masters', {
                url: '/masters/:view',
                templateUrl: 'views/masters.html',
                controller: 'MastersCtrl',
                data: {pageTitle : 'Masters', viewBtns : true}
            })

            .state('salt.dashboard.resources.masters.detail', {
                url: '/:hostname',
                templateUrl: 'views/masters.detail.html',
                controller: 'MastersCtrl'
            })

            /*********/
            // Dashboard > Reports
            .state('salt.dashboard.reports', {
                url: '/reports',
                templateUrl: 'views/tabs/reports.html',
                controller: 'JobsCtrl'
            })

            .state('salt.dashboard.reports.minions', {
                url: '/minions/',
                templateUrl: 'views/reports.html',
                controller: 'ReportsCtrl'
            })
            
            .state('salt.dashboard.resources.minions-reports', {
                url: '/minions/dashboard',
                templateUrl: 'views/reports.html',
                controller: 'ReportsCtrl'
            })
            
             .state('salt.dashboard.resources.quicktargtes-reports', {
                url: '/quicktarget/dashboard',
                templateUrl: 'views/reports.html',
                controller: 'ReportsCtrl'
            })

            .state('salt.dashboard.resources.target-reports', {
                url: '/targets/:targetId/dashboard',
                templateUrl: 'views/target.reports.html',
                controller: 'ReportsCtrl'
            })

            //All minions
            .state('salt.dashboard.resources.minions', {
                url: '/minions/:view',
                templateUrl: 'views/minions.html',
                controller: 'MinionsCtrl',
                data: {pageTitle : 'Minions - All' , viewBtns : true}
            })

            //All minions for a master
            .state('salt.dashboard.resources.minions.master', {
                url: '/master/:masterId',
                templateUrl: 'views/minions.html',
                controller: 'MinionsCtrl',
            })

            //Minion detail
            .state('salt.dashboard.resources.minions.detail', {
                url: '/details/:minionId',
                templateUrl: 'views/minions.detail.html',
                controller: 'MinionsCtrl'
            })

            .state('salt.dashboard.resources.quicktargets', {
                url: '/quicktargets/:view',
                templateUrl: 'views/quicktargets.html',
                controller: 'MinionsCtrl',
                data: {pageTitle : 'Quick Target' , viewBtns : true}
            })
            
            .state('salt.dashboard.resources.quicktargets.minions', {
                url: '/details/:minionId',
                templateUrl: 'views/minions.detail.html',
                controller: 'MinionsCtrl'
            })

            .state('salt.dashboard.resources.targets', {
                url : '/targets/:targetId/:view',
                templateUrl: 'views/targets.html',
                controller: 'MinionsCtrl',
                data: { pageTitle : 'Targets' , viewBtns : true }
            })

            .state('salt.dashboard.resources.target-beacons', {
                url : '/targets/:targetId/:view/beacons',
                templateUrl: 'views/target.beacons.html',
                controller: 'BeaconsCtrl',
                data: { pageTitle : 'Beacons' , viewBtns : true }
            })

            .state('salt.dashboard.resources.job-history', {
                url: '/job/history/:targetId',
                templateUrl: 'views/target.job.history.html',
                controller: 'MinionsCtrl',
                data: { pageTitle : 'Target Job History' , viewBtns : true }
            })
            
            .state('salt.dashboard.resources.minions-job-history', {
                url: '/job/minions/history/:view',
                templateUrl: 'views/minions.job.history.html',
                controller: 'MinionsCtrl',
                data: { pageTitle : 'Minion Job History' , viewBtns : true }
            })

            .state('salt.dashboard.jobs.sls-job-history', {
                url: '/sls/history/:jobId',
                templateUrl: 'views/sls.job.history.html',
                controller: 'JobsCtrl',
                data: { pageTitle : 'SLS Execution History' , viewBtns : true }
            })

            .state('salt.dashboard.resources.targets.minions', {
                url: '/details/:minionId',
                templateUrl: 'views/minions.detail.html',
                controller: 'MinionsCtrl'
            })

            /*********/
            // Dashboard > Jobs
            .state('salt.dashboard.jobs', {
                url: '/jobs',
                templateUrl: 'views/tabs/jobs.html',
                controller: 'JobsCtrl'
            })

            //List all jobs
            .state('salt.dashboard.jobs.list', {
                url: '/list',
                templateUrl: 'views/jobs.html',
                controller: 'JobsCtrl',
                data: {pageTitle : 'Jobs - All', viewBtns : false}
            })

            //List jobs in a folder
            .state('salt.dashboard.jobs.folder', {
                url: '/:folderId',
                templateUrl: 'views/jobs.html',
                controller: 'JobsCtrl',
                data: {pageTitle : 'Jobs - All', viewBtns : false}
            })

            .state('salt.dashboard.jobs.detail', {
                url: '/detail/:jobId',
                templateUrl: 'views/jobs.detail.html',
                controller: 'JobsCtrl',
                data: {pageTitle : 'Jobs - All', viewBtns : false}
            })

            /*.state('salt.dashboard.jobs.folder.detail', {
                url: '/:jobId',
                templateUrl: 'views/jobs.detail.html',
                controller: 'JobsCtrl',
                data: {pageTitle : 'Jobs - All', viewBtns : false}
            })*/

//            .state('salt.dashboard.jobs.sls', {
//                url: '/sls/:jobId',
//                templateUrl: 'views/jobs.sls.html',
//                controller: 'JobsCtrl',
//                data: {pageTitle : 'SLS', viewBtns : false}
//            })

            
//
//            .state('salt.dashboard.jobs.add', {
//                url: '/add',
//                templateUrl: 'views/jobs.add.html'
//            })
            /*********/
            // Dashboard > Settings
            .state('salt.dashboard.settings', {
                url: '/settings',
                templateUrl: 'views/tabs/settings.html',
                data: {pageTitle : ''}
            })

            // Dashboard > Settings
            .state('salt.dashboard.settings.masters', {
	            url: '/masters',
	            templateUrl: 'views/settings.masters.html',
	            controller: 'MastersCtrl',
	            data: {pageTitle : 'Masters', viewBtns : false}
	        })

	        .state('salt.dashboard.settings.masters.add', {
	            url: '/add',
	            templateUrl: 'views/settings.masters.add.html'
	        })

	        .state('salt.dashboard.settings.masters.edit', {
	            url: '/edit/:masterId',
	            templateUrl: 'views/settings.masters.edit.html',
	            controller: 'MastersCtrl'
	        })

	        .state('salt.dashboard.settings.masters.list', {
	            url: '/list',
	            templateUrl: 'views/settings.masters.list.html'
	        })

	        .state('salt.dashboard.settings.users', {
                url: '/users',
                templateUrl: 'views/settings.users.html',
                controller: 'UsersCtrl',
                data: {pageTitle : 'Users', viewBtns : false}
            })

            .state('salt.dashboard.settings.users.list', {
                url: '/list',
                templateUrl: 'views/settings.users.list.html'
            })

            .state('salt.dashboard.settings.users.add', {
                url: '/add',
                templateUrl: 'views/settings.users.add.html'
            })

            .state('salt.dashboard.settings.users.edit', {
                url: '/edit',
                templateUrl: 'views/settings.users.edit.html'
            })
        
        	.state('salt.dashboard.settings.beacons', {
        		url: '/beacons',
        		templateUrl: 'views/settings.beacons.html',
        		controller: 'BeaconsCtrl',
        		data: {pageTitle : 'Beacons', viewBtns : false}
        	})
        	
        	.state('salt.dashboard.settings.beacons.list', {
	            url: '/list',
	            templateUrl: 'views/settings.beacons.list.html'
	        });
        /*********/
        $urlRouterProvider.otherwise('/dashboard');
    }])

    .run(['$state', '$rootScope', '$location', 'SaltAuthService', function($state, $rootScope, $location, SaltAuthService) {
        $rootScope.$on( '$stateChangeStart', function(e, toState) {
            var loggedIn = SaltAuthService.isUserLoggedIn();

            //If going to login
            if(toState.name === 'salt.login') {
                return;
            }

            //Redirect to login if the user is not logged in
            if (!loggedIn) {
                e.preventDefault();
                $state.go('salt.login');
            }
        });
        $rootScope.state = $state;
    }])

    .config(['$httpProvider', 'growlProvider', function($httpProvider, growlProvider) {
        $httpProvider.interceptors.push('myHttpInterceptor');
        growlProvider.onlyUniqueMessages(true);
        growlProvider.globalTimeToLive(5000);
        growlProvider.globalPosition('top-center');
    }])

    .factory('myHttpInterceptor', ['$q', '$rootScope', function($q, $rootScope) {
        var numLoadings = 0;
        $rootScope.loading = false;
        return {
            request: function (config) {
                numLoadings++;
                $rootScope.$broadcast('loader_show');
                $rootScope.loading = true;
                return config || $q.when(config);
            },
            response: function (response) {
                if ((--numLoadings) === 0) {
                    $rootScope.$broadcast('loader_hide');
                    $rootScope.loading = false;
                }
                return response || $q.when(response);
            },
            responseError: function (response) {
                if (!(--numLoadings)) {
                    $rootScope.$broadcast('loader_hide');
                    $rootScope.loading = false;
                }
                return $q.reject(response);
            }
        };
    }])

    .filter('unsafe', ['$sce', function ($sce) {
        return function (val) {
            return $sce.trustAsHtml(val);
        };
    }])

    .run(['$templateCache', function ($templateCache) {
        $templateCache.put('template/popover/popover.html',
          '<div class="popover {{placement}}" ng-class="{ in: isOpen(), fade: animation() }">\n' +
          '  <div class="arrow"></div>\n' +
          '\n' +
          '  <div class="popover-inner">\n' +
          '      <h3 class="popover-title" ng-bind-html="title | unsafe" ng-show="title"></h3>\n' +
          '      <div class="popover-content"ng-bind-html="content | unsafe"></div>\n' +
          '  </div>\n' +
          '</div>\n' +
          ''),
          /*jshint -W030 */
          $templateCache.put('time-date.tpl.html',
                  '<div ng-class="modeClass()" class="time-date">'+
                  '<div ng-click="modeSwitch()" class="display">'+
                    '<div class="title">{{display.title()}}</div>'+
                    '<div class="content">'+
                      '<div class="super-title">{{display.super()}}</div>'+
                      '<div ng-bind-html="display.main()" class="main-title"></div>'+
                      '<div class="sub-title">{{display.sub()}}</div>'+
                    '</div>'+
                  '</div>'+
                  '<div class="control">'+
                    '<div class="slider">'+
                      '<div class="date-control">'+
                        '<div class="title"><span class="month-part">{{date | date:'+'MMMM'+'}}'+
                            '<select ng-model="calendar._month" ng-change="calendar.monthChange();save();" ng-options="calendar._months.indexOf(month) as month for month in calendar._months"></select></span>'+
                          '<input ng-model="calendar._year" ng-change="calendar.monthChange();save();" type="number" class="year-part"/>'+
                        '</div>'+
                        '<div class="headers">'+
                          '<div class="day-cell">S</div>'+
                          '<div class="day-cell">M</div>'+
                          '<div class="day-cell">T</div>'+
                          '<div class="day-cell">W</div>'+
                          '<div class="day-cell">T</div>'+
                          '<div class="day-cell">F</div>'+
                          '<div class="day-cell">S</div>'+
                        '</div>'+
                        '<div class="days">'+
                          '<div ng-style="{'+'left'+': calendar.offsetMargin()}" ng-class="calendar.class(1)" ng-show="calendar.isVisible(1)" ng-click="calendar.select(1);save();" class="day-cell">1</div>'+
                          '<div ng-class="calendar.class(2)" ng-show="calendar.isVisible(2)" ng-click="calendar.select(2);save();" class="day-cell">2</div>'+
                          '<div ng-class="calendar.class(3)" ng-show="calendar.isVisible(3)" ng-click="calendar.select(3);save();" class="day-cell">3</div>'+
                          '<div ng-class="calendar.class(4)" ng-show="calendar.isVisible(4)" ng-click="calendar.select(4);save();" class="day-cell">4</div>'+
                          '<div ng-class="calendar.class(5)" ng-show="calendar.isVisible(5)" ng-click="calendar.select(5);save();" class="day-cell">5</div>'+
                          '<div ng-class="calendar.class(6)" ng-show="calendar.isVisible(6)" ng-click="calendar.select(6);save();" class="day-cell">6</div>'+
                          '<div ng-class="calendar.class(7)" ng-show="calendar.isVisible(7)" ng-click="calendar.select(7);save();" class="day-cell">7</div>'+
                          '<div ng-class="calendar.class(8)" ng-show="calendar.isVisible(8)" ng-click="calendar.select(8);save();" class="day-cell">8</div>'+
                          '<div ng-class="calendar.class(9)" ng-show="calendar.isVisible(9)" ng-click="calendar.select(9);save();" class="day-cell">9</div>'+
                          '<div ng-class="calendar.class(10)" ng-show="calendar.isVisible(10)" ng-click="calendar.select(10);save();" class="day-cell">10</div>'+
                          '<div ng-class="calendar.class(11)" ng-show="calendar.isVisible(11)" ng-click="calendar.select(11);save();" class="day-cell">11</div>'+
                          '<div ng-class="calendar.class(12)" ng-show="calendar.isVisible(12)" ng-click="calendar.select(12);save();" class="day-cell">12</div>'+
                          '<div ng-class="calendar.class(13)" ng-show="calendar.isVisible(13)" ng-click="calendar.select(13);save();" class="day-cell">13</div>'+
                          '<div ng-class="calendar.class(14)" ng-show="calendar.isVisible(14)" ng-click="calendar.select(14);save();" class="day-cell">14</div>'+
                          '<div ng-class="calendar.class(15)" ng-show="calendar.isVisible(15)" ng-click="calendar.select(15);save();" class="day-cell">15</div>'+
                          '<div ng-class="calendar.class(16)" ng-show="calendar.isVisible(16)" ng-click="calendar.select(16);save();" class="day-cell">16</div>'+
                          '<div ng-class="calendar.class(17)" ng-show="calendar.isVisible(17)" ng-click="calendar.select(17);save();" class="day-cell">17</div>'+
                          '<div ng-class="calendar.class(18)" ng-show="calendar.isVisible(18)" ng-click="calendar.select(18);save();" class="day-cell">18</div>'+
                          '<div ng-class="calendar.class(19)" ng-show="calendar.isVisible(19)" ng-click="calendar.select(19);save();" class="day-cell">19</div>'+
                          '<div ng-class="calendar.class(20)" ng-show="calendar.isVisible(20)" ng-click="calendar.select(20);save();" class="day-cell">20</div>'+
                          '<div ng-class="calendar.class(21)" ng-show="calendar.isVisible(21)" ng-click="calendar.select(21);save();" class="day-cell">21</div>'+
                          '<div ng-class="calendar.class(22)" ng-show="calendar.isVisible(22)" ng-click="calendar.select(22);save();" class="day-cell">22</div>'+
                          '<div ng-class="calendar.class(23)" ng-show="calendar.isVisible(23)" ng-click="calendar.select(23);save();" class="day-cell">23</div>'+
                          '<div ng-class="calendar.class(24)" ng-show="calendar.isVisible(24)" ng-click="calendar.select(24);save();" class="day-cell">24</div>'+
                          '<div ng-class="calendar.class(25)" ng-show="calendar.isVisible(25)" ng-click="calendar.select(25);save();" class="day-cell">25</div>'+
                          '<div ng-class="calendar.class(26)" ng-show="calendar.isVisible(26)" ng-click="calendar.select(26);save();" class="day-cell">26</div>'+
                          '<div ng-class="calendar.class(27)" ng-show="calendar.isVisible(27)" ng-click="calendar.select(27);save();" class="day-cell">27</div>'+
                          '<div ng-class="calendar.class(28)" ng-show="calendar.isVisible(28)" ng-click="calendar.select(28);save();" class="day-cell">28</div>'+
                          '<div ng-class="calendar.class(29)" ng-show="calendar.isVisible(29)" ng-click="calendar.select(29);save();" class="day-cell">29</div>'+
                          '<div ng-class="calendar.class(30)" ng-show="calendar.isVisible(30)" ng-click="calendar.select(30);save();" class="day-cell">30</div>'+
                          '<div ng-class="calendar.class(31)" ng-show="calendar.isVisible(31)" ng-click="calendar.select(31);save();" class="day-cell">31</div>'+
                        '</div>'+
                      '</div>'+
                      '<div ng-hide="true" ng-click="modeSwitch()" class="button switch-control"><i class="glyphicon glyphicon-time"></i><i class="glyphicon glyphicon-calendar"></i></div>'+
                      '<div class="time-control">'+
                        '<div class="clock">'+
                          '<div class="clock-face">'+
                            '<div class="center"></div>'+
                            '<div ng-click="clock.setHour(1);save();" ng-class="{'+'selected'+': clock._hour() == 1}" class="hand">1</div>'+
                            '<div ng-click="clock.setHour(2);save();" ng-class="{'+'selected'+': clock._hour() == 2}" class="hand">2</div>'+
                            '<div ng-click="clock.setHour(3);save();" ng-class="{'+'selected'+': clock._hour() == 3}" class="hand">3</div>'+
                            '<div ng-click="clock.setHour(4);save();" ng-class="{'+'selected'+': clock._hour() == 4}" class="hand">4</div>'+
                            '<div ng-click="clock.setHour(5);save();" ng-class="{'+'selected'+': clock._hour() == 5}" class="hand">5</div>'+
                            '<div ng-click="clock.setHour(6);save();" ng-class="{'+'selected'+': clock._hour() == 6}" class="hand">6</div>'+
                            '<div ng-click="clock.setHour(7);save();" ng-class="{'+'selected'+': clock._hour() == 7}" class="hand">7</div>'+
                            '<div ng-click="clock.setHour(8);save();" ng-class="{'+'selected'+': clock._hour() == 8}" class="hand">8</div>'+
                            '<div ng-click="clock.setHour(9);save();" ng-class="{'+'selected'+': clock._hour() == 9}" class="hand">9</div>'+
                            '<div ng-click="clock.setHour(10);save();" ng-class="{'+'selected'+': clock._hour() == 10}" class="hand">10</div>'+
                            '<div ng-click="clock.setHour(11);save();" ng-class="{'+'selected'+': clock._hour() == 11}" class="hand">11</div>'+
                            '<div ng-click="clock.setHour(12);save();" ng-class="{'+'selected'+': clock._hour() == 12}" class="hand">12</div>'+
                          '</div>'+
                        '</div>'+
                        '<div class="buttons">'+
                          '<button ng-click="clock.setAM(true);save();" ng-class="{'+'active'+': clock.isAM()}" type="button" class="btn btn-link pull-left morning-button">AM</button>'+
                          '<input value="30" type="number" min="0" max="59" ng-click="save()" ng-model="clock._minutes"/>'+
                          '<button ng-click="clock.setAM(false);save();" ng-class="{'+'active'+': !clock.isAM()}" type="button" class="btn btn-link pull-right morning-button">PM</button>'+
                        '</div>'+
                      '</div>'+
                    '</div>'+                  '</div>'+
                  '<div class="buttons" ng-hide="true">'+
                    '<button ng-click="setNow()" type="button" class="btn btn-link">Now</button>'+
                    '<button ng-click="cancel()" type="button" class="btn btn-link">Cancel</button>'+
                    '<button ng-click="save()" type="button" class="btn btn-link">OK</button>'+
                  '</div>'+
                '</div>');
          
    }]);

'use strict';

/**
 * @ngdoc directive
 * @name sseFeApp.directive:header
 * @description
 * # header
 */
angular.module('sseFeApp')
    .directive('header', function () {
        return {
            templateUrl: 'views/directives/header.html',
            restrict: 'E',
            link: function postLink() {
                //scope, element, attrs
            }
        };
    });

'use strict';

/**
 * @ngdoc directive
 * @name sseFeApp.directive:footer
 * @description
 * # footer
 */
angular.module('sseFeApp')
    .directive('footer', function () {
        return {
            templateUrl: 'views/directives/footer.html',
            restrict: 'E',
            link: function postLink() {
                //scope, element, attrs
            }
        };
    });

'use strict';

/**
 * @ngdoc function
 * @name sseFeApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Salt Login Controller
 */
angular.module('sseFeApp')
    .controller('LoginCtrl', ['$scope', '$location', 'SaltAuthService', 'SaltMasterService', 'SaltConfig', '$state', 'lodash', 'growl', function ($scope, $location, SaltAuthService, SaltMasterService, SaltConfig, $state, lodash, growl) {
        $scope.user     = {};

        /**
         * Login the user with the form data
         * @param {object} user The login credentials
         */
        $scope.login    = function(user) {
            $scope.user = user;
            SaltAuthService.login($scope.user)
                .then(function(response) {
                    growl.success('Welcome to SaltStack Enterprise');
                    SaltConfig.setUser(response.data.data);

                    /*jshint camelcase: false */
                    //If saltadmin
                    if(response.data.data.is_staff){
                    	SaltMasterService.getMasters()
                    	.then(function(response) {
                    	    if (response.data.data.results.length <= 0) {
                                $state.go('salt.dashboard.settings.masters.add');
                            } else {
                                $state.go('salt.dashboard.resources.masters');
                            }
                        }, function() {
                            growl.error('Internal Server Error');
                        });
                    }
                    else{
                        //Redirect
                        $state.go('salt.dashboard.resources.masters');
                    }
                }, function(response) {
                    switch(response.status) {
                        case 0:
                        case 500:
                            growl.error('Internal Server Error');
                        break;
                        
                        case 404:
                            growl.error('Internal Server Error');
                        break;
                        
                        case 401:
                            if(response.data.error[0] === 'unauthorized_access') {
                                growl.error('Username or Password is incorrect');
                            }
                        break;
                        
                        default:
                            growl.error('Some error occurred');
                        break;
                    }
                });
            };
    }]);


'use strict';

/**
 * @ngdoc
 * @name sseFeApp.SaltAuthService
 * @description All the authentication related methods go here.
 * # SaltAuthService
 * Salt Authentication service
 */
angular.module('sseFeApp')
    .factory('SaltAuthService', ['$http', '$q', 'SaltConfig', '$state', 'SaltUrlService', function ($http, $q, SaltConfig, $state, SaltUrlService) {
        //Get all the user urls
        var _urls = SaltUrlService.getUrls('user');

        return {
            /**
             * Log the user in
             */
            login: function(user) {
                var config = {
                        url: _urls.authenticate,
                        method: 'post',
                        data: user
                    };

                return $http(config);
            },

            /**
             * Log the user out
             */
            logout: function() {
                SaltConfig.destroyUser();
                $state.go('salt.login');
            },

            /**
             * Check if the user is logged in
             */
            isUserLoggedIn: function() {
                return !!SaltConfig.getUser();
            },

            getTargetData: function() {
                var config = {
                        headers: {
                            AUTHORIZATION : 'Token '+SaltConfig.getUser().token
                        }
                    };

                return $http.get(_urls.count, config);
            }
        };
    }]);

'use strict';

/**
 * @ngdoc
 * @name sseFeApp.SaltConfig
 * @description All global configuration variables go here.
 * # SaltConfig
 * Salt Global Configuration
 */
angular.module('sseFeApp')
    .factory('SaltConfig', ['$window', function($window) {
        /**
         * Public methods
         */
        return {
            /**
             * Sets current user data
             * @param {object} user Logged in user data
             */
            setUser: function(user) {
                $window.localStorage.setItem('user', JSON.stringify(user));
            },

            /**
             * Return current user's data
             * @return {object} Current user's config object
             */
            getUser: function() {
                return JSON.parse($window.localStorage.getItem('user'));
            },

            /**
             * Destroy user data, hence invalidating the session
             */
            destroyUser: function(){
                $window.localStorage.removeItem('user');
            },

            /**
             * Set a value in the localstorage
             * @param {string} key The key
             * @param {string} value The value
             */
            setData: function(key, value) {
                $window.localStorage.setItem(key, value);
            },

            /**
             * Get a value from the localstorage
             * @param {string} key The required key
             * @return {string} The value
             */
            getData: function(key) {
                return $window.localStorage.getItem(key);
            },

            /**
             * Remove a key from the localstorage
             * @param {string} key The key to be removed
             */
            removeData: function(key) {
                $window.localStorage.removeItem(key);
            }
        };
    }]);

'use strict';

/**
 * @ngdoc service
 * @name sseFeApp.SaltUtilities
 * @description
 * # SaltUtilities
 * Factory in the sseFeApp.
 */
angular.module('sseFeApp')
    .factory('SaltUtilities', ['$location', function (location) {
        // Service logic
        // ...

        // Public API here
        return {
            checkPage: function (page) {
                if(location.$$url === page){
                    return true;
                }
            }
        };
    }]);

'use strict';

/**
 * @ngdoc function
 * @name sseFeApp.controller:DashboardCtrl
 * @description
 * # DashboardCtrl
 * Controller of the sseFeApp
 */
angular.module('sseFeApp')
    .controller('DashboardCtrl', ['$scope', '$rootScope', 'SaltAuthService', 'SaltConfig', 'SaltMasterService', 'SaltMinionService', 'SaltJobService', '$window', '$state', 'lodash', '$modal', 'growl', 'WebSockService', '$stateParams', '$modalStack', function($scope, $rootScope, SaltAuthService, SaltConfig, SaltMasterService, SaltMinionService, SaltJobService, $window, $state, lodash, $modal, growl, WebSockService, $stateParams, $modalStack) {
        //Toggle grid and list view
        $scope.mode = 1;
        $scope.confirmDeleteModal = {};
        
        /**
         * Log the current user out of the application
         */
        $scope.logout = function() {
            ws.send('logout');
            SaltAuthService.logout();
        };

        //Watch for display master detail event
        $scope.$on('displayMasterDetail', function() {
            $scope.currentMaster = SaltMasterService.getCurrent();
        });

        //Watch for display master detail event
        $scope.$on('editMasterDetail', function() {
            $scope.currentMasterEdit = SaltMasterService.getCurrent();
        });

        /**
         * Watch for the quick target count update event
         * @param {object} event The event object
         * @param {number} count The quick target count
         */
        $scope.$on('quickTargetCountUpdate', function(event, count) {
            $scope.quickTargetCount =  count;
        });

        /**
         * Open the help document
         */
        $scope.openHelp = function() {
            $window.open(window.location.hash ? 'help/index.html?r=' + window.location.hash.substr(1) : 'help/index.html');
        };

        //Currently logged in user's name
        $scope.username = SaltConfig.getUser().username;
        
        $scope.currentState = $state;

        $scope.targetInfo = {};
        $scope.quickTargetCount = 0;

        /**
         * Get entity counts
         */
        SaltAuthService.getTargetData()
        .then(function(response) {
            var qtIndex = lodash.findIndex(response.data.data.results, function(result){ return lodash.has(result, 'quick_target_count'); }),
                minIndex = lodash.findIndex(response.data.data.results, function(result){ return lodash.has(result, 'minion_count'); });
           /*jshint camelcase: false */
            $scope.quickTargetCount = response.data.data.results[qtIndex].quick_target_count;
            $scope.minionsCount = response.data.data.results[minIndex].minion_count;

            //Remove the quick target count node
            response.data.data.results.splice(minIndex, 1);
            response.data.data.results.splice(qtIndex, 1);

            //Set target count
            $scope.targetInfo = lodash.remove(response.data.data.results, function(target) { return target.is_user_favorite; });
            $scope.systemTargetInfo = response.data.data.results;
        });

        /**
         * Confirm target deletion modal
         * @param {number} targetId The id of the target to be deleted
         */
        $scope.confirmDeleteTarget = function(deleteTargetObj, selectedMinions) {
            $scope.targetId = deleteTargetObj;

            //Create
            $scope.confirmDeleteModal = $modal.open({
                templateUrl : 'views/dialogs/confirmDelete.html',
                scope       : $scope,
                backdrop    : 'static'
            });

            //Accept
            $scope.confirmDeleteOk = function() {
                $scope.confirmDeleteModal.close($scope.targetId);
            };

            //Reject
            $scope.confirmDeleteCancel = function() {
                $scope.confirmDeleteModal.dismiss();
            };

            if(selectedMinions.length > 0) {
                var selected = {};
                for(var i = 1; i <= selectedMinions.length; i++){
                    selected['m'+i] = selectedMinions[i - 1];
                }
            }

            //Handle promise
            $scope.confirmDeleteModal.result.then(function(response) {
                $scope.deleteTarget(response, selected);
            }, function() {
                //Nothing
            });
        };

        /**
         * Target deletion
         */
        $scope.deleteTarget = function(targetId, selectedMinions) {
            SaltMinionService.deleteTarget(targetId, selectedMinions)
            .then(function() {
                if(typeof selectedMinions === 'undefined') {
                    growl.success('Target successfully deleted.');
                    $state.go('salt.dashboard.resources.minions', {}, {reload: true});
                } else {
                    growl.success('Selected minions successfully removed from the current target.');
                    $state.go($state.current, {}, {reload: true});
                }
            }, function(response) {
                switch(response.status) {
                    case 0:
                    case 500:
                        growl.error('Server not reachable.');
                    break;

                    case 400:
                        if(response.data.error[0] === 'token_not_provided') {
                            growl.error('Token not provided.');
                        } else if(response.data.error[0] === 'target_created_by_another_user') {
                            growl.error('Can\'t delete a target created by another user.');
                        }
                    break;

                    case 401:
                        growl.error('Unauthorized access.');
                    break;

                    case 404:
                        growl.error('Invalid url.');
                    break;

                    default:
                        growl.error('Some error occurred.');
                    break;
                }
            });
        };
        
        
        /**
         * Edit target dialog
         */
        $scope.editTarget = function(editTargetObj) {
            /*jshint camelcase: false */
            //Copy the object with POST variable names
            $scope.editTargetData = { 
                target_id       : editTargetObj.id,
                old_target_name : editTargetObj.target_name,
                new_target_name : editTargetObj.target_name
            };

            //Create
            $scope.editTargetModal = $modal.open({
                templateUrl : 'views/dialogs/editTarget.html',
                scope       : $scope,
                backdrop    : 'static'
            });

            //Accept
            $scope.editTargetOk = function() {
                //Reject blank or invalid name
                if(!$scope.editTargetData.new_target_name || $scope.editTargetData.new_target_name === '') {
                    growl.error('Please enter a valid target name.');
                }

                //If the name is unchanged, dismiss the modal with no action
                else if($scope.editTargetData.new_target_name === $scope.editTargetData.old_target_name) {
                    growl.info('Target name unchanged.');
                    $scope.editTargetModal.dismiss();
                }

                //Edit
                else {
                    $scope.editTargetModal.close();
                }
            };

            //Reject
            $scope.editTargetCancel = function() {
                $scope.editTargetModal.dismiss();
            };

            //Handle promise
            $scope.editTargetModal.result.then(function() {
                $scope.editTargetService();
            }, function() {
                //Nothing
            });
        };

        /**
         * Edit target - Service call
         */
        $scope.editTargetService = function() {
            SaltMinionService.editTarget($scope.editTargetData)
            .then(function() {
                $state.go($state.current, {}, {reload: true});
                growl.info('Target edited succesfully.');
            }, function(response) {
                switch(response.status) {
                    case 0:
                    case 500:
                        growl.warning('Internal Server error');
                    break;

                    case 400:
                        if(response.data.error[0] === 'target_exists') {
                            growl.error('Target already exists.');
                        } else if(response.data.error[0] === 'target_name_empty') {
                            growl.error('Please enter a valid target name.');
                        } else if(response.data.error[0] === 'user_not_allowed_to_target') {
                            growl.error('You dont have permission to edit target');
                        } else {
                            growl.error('Bad request.');
                        }
                    break;

                    case 401:
                        growl.error('Unauthorized access.');
                    break;
                }
            });
        };
        

        /***
         * Web Socket connection
         */
        var ws = WebSockService.connect('ws://' + window.location.hostname  + ':8888/ws/'+SaltConfig.getUser().token);
        /***
         * Web socket on connection open
         */
        ws.onopen = function() {
            console.log('Succeeded to open a connection');
        };
        /***
         * Web socket on error
         */
        ws.onerror = function() {
            console.log('Failed to open a connection');
        };
        /***
         * Web socket on message
         */
        ws.onmessage = function(message) {
            console.log(message);
            //Dismiss modal, if visible
            $modalStack.dismissAll();
            switch(message.data) {
                case 'token_expired':
                    growl.warning('Your session has expired. Please log in again.');
                    $state.go('salt.login');
                break;
                case 'invalid_token':
                    growl.warning('Invalid token. Please log in again.');
                    $state.go('salt.login');
                break;
            }
        };
        /***
         * Web socket on connection close
         */
        ws.onclose = function() {
            console.log('Succeeded to close a connection');
        };

        

        $scope.status = {
            isopen: false
        };

        $scope.toggleDropdown = function($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.status.isopen = !$scope.status.isopen;
        };

        /**
         * Add target folder dialog
         */
        $scope.addTargetFolder = function(parentInfo) {
            $scope.parentInfo = parentInfo;

            //Create
            $scope.addTargetFolderModal = $modal.open({
                templateUrl : 'views/dialogs/confirmAddTargetFolder.html',
                scope       : $scope,
                backdrop    : 'static'
            });

            //Accept
            $scope.addTargetFolderOk = function(targetFolder) {
                if(!targetFolder || targetFolder === '') {
                    growl.error('Please enter a valid folder name.');
                    return;
                }
                $scope.addTargetFolderModal.close(targetFolder);
            };

            //Reject
            $scope.addTargetFolderCancel = function() {
                $scope.addTargetFolderModal.dismiss();
            };

            //Handle promise
            $scope.addTargetFolderModal.result.then(function(response) {
                /*jshint camelcase: false */
                $scope.addTargetFolderData = response;
                $scope.addTargetFolderData.parent_id = $scope.parentInfo.id;
                $scope.addTargetFolderService();
            }, function() {
                //Nothing
            });
        };

        /**
         * Add target folder - Service call
         */
        $scope.addTargetFolderService = function() {
            SaltMinionService.addTargetFolder($scope.addTargetFolderData)
            .then(function() {
                $state.go($state.current, {}, {reload: true});
                growl.info('Folder created.');
            }, function(response) {
                switch(response.status) {
                    case 0:
                    case 500:
                        growl.warning('Internal Server error');
                    break;

                    case 400:
                        if(response.data.error[0] === 'folder_name_exists') {
                            growl.error('Folder already exists.');
                        } else if(response.data.error[0] === 'folder_name_empty') {
                            growl.error('Please enter a valid folder name.');
                        } else {
                            growl.error('Bad request.');
                        }
                    break;

                    case 401:
                        growl.error('Unauthorized access.');
                    break;
                }
            });
        };

        /**
         * Remove target folder dialog
         */
        $scope.removeTargetFolder = function(folder) {
            $scope.removeTargetFolderName = folder.name;
            $scope.removeTargetFolderId = folder.id;
            //Create
            $scope.removeTargetFolderModal = $modal.open({
                templateUrl : 'views/dialogs/confirmRemoveTargetFolder.html',
                scope       : $scope,
                backdrop    : 'static'
            });

            //Accept
            $scope.removeTargetFolderOk = function() {
                $scope.removeTargetFolderModal.close();
            };

            //Reject
            $scope.removeTargetFolderCancel = function() {
                $scope.removeTargetFolderModal.dismiss();
            };

            //Handle promise
            $scope.removeTargetFolderModal.result.then(function() {
                $scope.removeTargetFolderService();
            }, function() {
                //Nothing
            });
        };

        /**
         * Remove target folder - Service call
         */
        $scope.removeTargetFolderService = function() {
            SaltMinionService.removeTargetFolder($scope.removeTargetFolderId)
            .then(function() {
                $state.go($state.current, {}, {reload: true});
                growl.success('Folder deleted.');
            }, function(response) {
                switch(response.status) {
                    case 0:
                    case 500:
                        growl.warning('Server error.');
                    break;
                    
                    case 400:
                        if(response.data.error[0] === 'folder_doesnot_exists') {
                            growl.error('Folder does not exist.');
                        } else {
                            growl.error('Some error occurred.');
                        }
                }
            });
        };
        
        
        /**
         * Edit target folder dialog
         */
        
        $scope.editTargetFolder = function(editFolder) {
            /*jshint camelcase: false */
            $scope.editFolderData = {
                folder_id: editFolder.id,
                folder_old_name: editFolder.name,
                folder_new_name: editFolder.name
            };

            //Create
            $scope.editTargetFolderModal = $modal.open({
                templateUrl : 'views/dialogs/editTargetFolder.html',
                scope       : $scope,
                backdrop    : 'static'
            });

            //Accept
            $scope.editTargetFolderOk = function() {
                if(!$scope.editFolderData.folder_new_name || $scope.editFolderData.folder_new_name === '') {
                    growl.error('Please enter a valid folder name.');
                } else if($scope.editFolderData.folder_new_name === $scope.editFolderData.folder_old_name) {
                    growl.info('Folder name unchanged.');
                    $scope.editTargetFolderModal.dismiss();
                } else {
                    $scope.editTargetFolderModal.close();
                }
            };

            //Reject
            $scope.editTargetFolderCancel = function() {
                $scope.editTargetFolderModal.dismiss();
            };

            //Handle promise
            $scope.editTargetFolderModal.result.then(function() {
                $scope.editTargetFolderService();
            }, function() {
                //Nothing
            });
        };
        
        
        /**
         * Edit target folder - Service call
         */
        $scope.editTargetFolderService = function() {
            SaltMinionService.editTargetsFolder($scope.editFolderData)
            .then(function() {
                $state.go($state.current, {}, {reload: true});
                growl.info('Folder edited succesfully.');
            }, function(response) {
                switch(response.status) {
                    case 0:
                    case 500:
                        growl.warning('Server error.');
                    break;

                    case 400:
                        if(response.data.error[0] === 'folder_name_exists') {
                            growl.error('Folder already exists.');
                        } else if(response.data.error[0] === 'folder_name_empty') {
                            growl.error('Please enter a valid folder name.');
                        } else if(response.data.error[0] === 'user_not_allowed_to_edit_folder') {
                            growl.error('You dont have permission to edit folder');
                        } else {
                            growl.error('Bad request.');
                        }
                    break;

                    case 401:
                        growl.error('Unauthorized access.');
                    break;
                }
            });
        };

        $scope.targetMarkup = '';
        $scope.processTargets = function(list) {
            $scope.targetMarkup += '<ul>';
            for(var i = 0; i < list.length; i++) {
                if(list[i].children) {
                    $scope.targetMarkup += '<li>'+list[i].name;
                    $scope.processTargets(list[i].children);
                    $scope.targetMarkup += '</li>';
                } else {
                    $scope.targetMarkup += '<li>'+list[i].name+'</li>';
                }
            }
            $scope.targetMarkup += '</ul>';
        };

        /**
         * Get target folders structure for creating target from quick target
         */
        $scope.getTargetPublicFolderStructure = function() {
            SaltMinionService.getTargetPublicFolderStructure()
                .then(function(response) {
                    $scope.targetPublicFolderStructure = response.data.results;
                }, function(response) {
                    switch(response.status) {
                        case 0:
                        case 500:
                            growl.error('Some error occurred.');
                        break;

                        case 401:
                            growl.error('Unauthorized access.');
                        break;

                        case 400:
                            growl.error('No folders available.');
                        break;
                    }
                });
        };
        
        $scope.getTargetPrivateFolderStructure = function() {
            SaltMinionService.getTargetPrivateFolderStructure()
                .then(function(response) {
                    $scope.targetPrivateFolderStructure = response.data.results;
                }, function(response) {
                    switch(response.status) {
                        case 0:
                        case 500:
                            growl.error('Some error occurred.');
                        break;

                        case 401:
                            growl.error('Unauthorized access.');
                        break;

                        case 400:
                            growl.error('No folders available.');
                        break;
                    }
                });
        };

        /**
         * Get Job folders structure.
         */
        $scope.getJobPublicFolderStructure = function() {
            SaltJobService.getJobPublicFolderStructure()
                .then(function(response) {
                    $scope.jobPublicFolderStructure = response.data.results;
                }, function(response) {
                    switch(response.status) {
                        case 0:
                        case 500:
                            growl.error('Some error occurred.');
                        break;

                        case 401:
                            growl.error('Unauthorized access.');
                        break;

                        case 400:
                            growl.error('No folders available.');
                        break;
                    }
                });
        };
        
        $scope.getJobPrivateFolderStructure = function() {
            SaltJobService.getJobPrivateFolderStructure()
                .then(function(response) {
                    $scope.jobPrivateFolderStructure = response.data.results;
                }, function(response) {
                    switch(response.status) {
                        case 0:
                        case 500:
                            growl.error('Some error occurred.');
                        break;

                        case 401:
                            growl.error('Unauthorized access.');
                        break;

                        case 400:
                            growl.error('No folders available.');
                        break;
                    }
                });
        };

        //call for get folder structure
        $scope.getTargetPublicFolderStructure();
        $scope.getTargetPrivateFolderStructure();
        $scope.getJobPublicFolderStructure();
        $scope.getJobPrivateFolderStructure();

        /**
         * Add Job folder dialog
         */
        $scope.addJobFolder = function(parentInfo) {
            $scope.parentInfo = parentInfo;

            //Create
            $scope.addJobFolderModal = $modal.open({
                templateUrl : 'views/dialogs/confirmAddJobFolder.html',
                scope       : $scope,
                backdrop    : 'static'
            });

            //Accept
            $scope.addJobFolderOk = function(jobFolder) {
                if(!jobFolder || jobFolder === '') {
                    growl.error('Please enter a valid folder name.');
                    return;
                }
                $scope.addJobFolderModal.close(jobFolder);
            };

            //Reject
            $scope.addJobFolderCancel = function() {
                $scope.addJobFolderModal.dismiss();
            };

            //Handle promise
            $scope.addJobFolderModal.result.then(function(response) {
                /*jshint camelcase: false */
                $scope.addJobFolderData = response;
                $scope.addJobFolderData.parent_id = $scope.parentInfo.id;
                $scope.addJobFolderService();
            }, function() {
                //Nothing
            });
        };

        /**
         * Add job folder - Service call
         */
        $scope.addJobFolderService = function() {
            SaltJobService.addJobFolder($scope.addJobFolderData)
            .then(function() {
                $state.go($state.current, {}, {reload: true});
                growl.info('Folder created.');
            }, function(response) {
                switch(response.status) {
                    case 0:
                    case 500:
                        growl.warning('Internal Server error');
                    break;

                    case 400:
                        if(response.data.error[0] === 'folder_name_exists') {
                            growl.error('Folder already exists.');
                        } else if(response.data.error[0] === 'folder_name_empty') {
                            growl.error('Please enter a valid folder name.');
                        } else {
                            growl.error('Bad request.');
                        }
                    break;

                    case 401:
                        growl.error('Unauthorized access.');
                    break;
                }
            });
        };

        /**
         * Remove job folder dialog
         */
        $scope.removeJobFolder = function(folder) {
            $scope.removeJobFolderName = folder.name;
            $scope.removeJobFolderId = folder.id;
            //Create
            $scope.removeJobFolderModal = $modal.open({
                templateUrl : 'views/dialogs/confirmRemoveJobFolder.html',
                scope       : $scope,
                backdrop    : 'static'
            });

            //Accept
            $scope.removeJobFolderOk = function() {
                $scope.removeJobFolderModal.close();
            };

            //Reject
            $scope.removeJobFolderCancel = function() {
                $scope.removeJobFolderModal.dismiss();
            };

            //Handle promise
            $scope.removeJobFolderModal.result.then(function() {
                $scope.removeJobFolderService();
            }, function() {
                //Nothing
            });
        };

        /**
         * Remove job folder - Service call
         */
        $scope.removeJobFolderService = function() {
            SaltJobService.removeJobFolder($scope.removeJobFolderId)
            .then(function() {
                $state.go($state.current, {}, {reload: true});
                growl.success('Folder deleted.');
            }, function(response) {
                switch(response.status) {
                    case 0:
                    case 500:
                        growl.warning('Server error.');
                    break;
                    
                    case 400:
                        if(response.data.error[0] === 'folder_doesnot_exists') {
                            growl.error('Folder does not exist.');
                        } else {
                            growl.error('Some error occurred.');
                        }
                }
            });
        };
        
        
        /**
         * Edit job folder dialog
         */
        
        $scope.editJobFolder = function(editFolder) {
            /*jshint camelcase: false */
            $scope.editFolderData = {
                folder_id: editFolder.id,
                folder_old_name: editFolder.name,
                folder_new_name: editFolder.name
            };

            //Create
            $scope.editJobFolderModal = $modal.open({
                templateUrl : 'views/dialogs/editJobFolder.html',
                scope       : $scope,
                backdrop    : 'static'
            });

            //Accept
            $scope.editJobFolderOk = function() {
                if(!$scope.editFolderData.folder_new_name || $scope.editFolderData.folder_new_name === '') {
                    growl.error('Please enter a valid folder name.');
                } else if($scope.editFolderData.folder_new_name === $scope.editFolderData.folder_old_name) {
                    growl.info('Folder name unchanged.');
                    $scope.editJobFolderModal.dismiss();
                } else {
                    $scope.editJobFolderModal.close();
                }
            };

            //Reject
            $scope.editJobFolderCancel = function() {
                $scope.editJobFolderModal.dismiss();
            };

            //Handle promise
            $scope.editJobFolderModal.result.then(function() {
                $scope.editJobFolderService();
            }, function() {
                //Nothing
            });
        };
        
        /**
         * Edit job folder - Service call
         */
        $scope.editJobFolderService = function() {
            SaltJobService.editJobFolder($scope.editFolderData)
            .then(function() {
                $state.go($state.current, {}, {reload: true});
                growl.info('Folder edited succesfully.');
            }, function(response) {
                switch(response.status) {
                    case 0:
                    case 500:
                        growl.warning('Server error.');
                    break;

                    case 400:
                        if(response.data.error[0] === 'folder_name_exists') {
                            growl.error('Folder already exists.');
                        } else if(response.data.error[0] === 'folder_name_empty') {
                            growl.error('Please enter a valid folder name.');
                        } else if(response.data.error[0] === 'user_not_allowed_to_edit_folder') {
                            growl.error('You dont have permission to edit folder');
                        } else {
                            growl.error('Bad request.');
                        }
                    break;

                    case 401:
                        growl.error('Unauthorized access.');
                    break;
                }
            });
        };
        /*
         * Open Job Schedular
         */
        
        $scope.openJobSchedular = function(selectdJob) {
            // Job 
            /*jshint camelcase: false */
            $scope.job = selectdJob;
            $scope.job.startDate = '';
            $scope.job.execute = 'now';
            $scope.job.runOnce = 'runonce';
            $scope.job.retry_option = 'retry_count';
            $scope.job.retry_count = 1;
            $scope.job.endDate = '';
            $scope.job.run_type = 'run';
            $scope.job.action_on_error = 'ignore';
            $scope.job.priority = 'none';
            $scope.job.mailOn = 'none';
            $scope.job.userIds = [];
            $scope.job.userNames = [];
            $scope.job.selectedUser = '';
            $scope.job.execute_at = '';
            $scope.job.end_after = '';
            $scope.job.minions = $scope.objectifyArray($rootScope.selectedMinions, 'm');
            $scope.job.notification = [];
            $scope.selectedUser = '';
            $scope.job.target = '';

            //Create
            $scope.openJobSchedularModal = $modal.open({
                templateUrl : 'views/dialogs/jobScheduler.html',
                scope       : $scope,
                windowClass: 'top-modal',
                backdrop    : 'static'
            });

            //Accept
            $scope.jobSchedularModalOk = function() {
                var jobDate = $scope.convertDate($scope.job.startDate);
                var jobTime = $scope.convertTime($scope.job.startDate);
                $scope.job.execute_at = jobDate + jobTime;

                if($scope.job.endDate !== undefined) {
                    var jobEndDate = $scope.convertDate($scope.job.endDate);
                    var jobEndTime = $scope.convertTime($scope.job.endDate);
                    $scope.job.end_after = jobEndDate + jobEndTime;
                }

                if($scope.job.runOnce === 'runonce') {
                    $scope.job.retry_option = null;
                    $scope.job.retry_count = null;
                    $scope.job.end_after = null;
                }

                if($state.current.name ==='salt.dashboard.resources.targets'){
                	$scope.job.target = $stateParams.targetId;
                }
                $scope.scheduleJobService();
            };

            //Reject
            $scope.jobSchedularModalCancel = function() {
                $scope.openJobSchedularModal.dismiss();
            };
        };

        /**
         * Job Schedule service call SaltJobService
         */
        $scope.scheduleJobService = function() {
            //If scheduling on a target, add the target ID
            if($state.current.name ==='salt.dashboard.resources.targets') {
                $scope.job.target = $state.params.targetId;
            }

            SaltJobService.scheduleJob($scope.job)
            .then(function() {
                growl.info('Job Scheduled succesfully.');
            }, function(response) {
                switch(response.status) {
                    case 0:
                    case 500:
                        growl.warning('Internal Server Error.');
                    break;

                    case 400:
                        if(response.data.error[0] === 'Select a valid choice') {
                            growl.error('Select a valid choice.');
                        } else {
                            growl.error('Bad request.');
                        }
                    break;

                    case 401:
                        growl.error('Unauthorized access.');
                    break;
                }
            });
        };

        /**
         * Convert a list to an object with the same key having ascending integers appended
         * @param {arrayObject} itemsArray The list of the items
         * @param {string} keyAlphabet 
         */
        $scope.objectifyArray = function(itemsArray, keyAlphabet) {
        	if($state.current.name ==='salt.dashboard.resources.targets'){
        		return;
        	}
        	
            var itemsObject = {};
            for(var i = 1; i <= itemsArray.length; i++){
                itemsObject[keyAlphabet+i] = itemsArray[i - 1];
            }

            return itemsObject;
        };

        // Date Conversion 
        $scope.convertDate = function(date) {
            // GET YYYY, MM AND DD FROM THE DATE OBJECT
            var yyyy = date.getFullYear().toString();
            var mm = (date.getMonth()+1).toString();
            var dd  = date.getDate().toString();
            // CONVERT mm AND dd INTO chars
            var mmChars = mm.split('');
            var ddChars = dd.split('');
            // CONCAT THE STRINGS IN YYYY-MM-DD FORMAT
            var datestring = yyyy + '-' + (mmChars[1]?mm:'0'+mmChars[0]) + '-' + (ddChars[1]?dd:'0'+ddChars[0]) + ' ';
            return datestring;
        };

        $scope.convertTime = function(date) {
            var newTime = date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1');
            return newTime;
        };

        /**
         * Select users for mailing operations
         *
         **/
        $scope.selectUser = function(user) {
            var userId = parseInt(user.id, 10); //Typecast, very important!
            var userName = user.name;

            //Check if the user name exists
            var index = lodash.indexOf($scope.job.userIds, userId);
            //If not, add it
            if(index === -1) {
                $scope.job.notification.push(userId);
                $scope.job.userNames.push(userName);
                }
        //Else remove it
            else {
                $scope.job.notification.splice(index, 1);
                $scope.job.userNames.splice(index, 1);
                }
            $scope.selectedUser = $scope.job.userNames.toString();
            };

            /*
             * For Calender Date
             */
            $scope.setDate = function() {
                $scope.date = new Date();
                return $scope.date;
            };
            $scope.setDate();
            /*
             * For Show Job Details.
             */
            $scope.showJobDetails = function() {
                console.log('show job details');
            };
    }])

    /**
     * Replace null or blank values with N/A
     */
    .filter('displayDefault', function() {
        return function(val) {
            if(!val || val === null || val === '') {
                val = 'N/A';
            }
            return val;
        };
    });

'use strict';

/**
 * @ngdoc function
 * @name sseFeApp.controller:MastersCtrl
 * @description
 * # MastersCtrl
 * Controller of the sseFeApp
 */
angular.module('sseFeApp')
    .controller('MastersCtrl', [ '$scope', 'SaltMasterService', '$q', '$modal', '$log', 'lodash','$state', '$stateParams', 'growl', function($scope, SaltMasterService, $q,$modal, $log, lodash, $state, $stateParams, growl) {
        var hostname = '';
        $scope.masters = undefined;
        $scope.selectedMasters = [];
        $scope.confirmDeleteModal = {};
        $scope.previousPage = 0;
        $scope.nextPage = 0;
        $scope.selectedAll = false;
        $scope.checkedMasters = [];
        $scope.showPagination = false;

        $scope.userDetails = [];
        $scope.userName = [];

        /**
         * Get all masters
         */
        $scope.getMasters = function(mastersPage) {
            var mastersParams = {};

            //Set page number if available
            if(typeof mastersPage !== 'undefined') {
                mastersParams.page = mastersPage;
            }

            SaltMasterService.getMasters(mastersParams)
            .then(function(response) {
                if(response.data.data.count > 0) {
                    $scope.masters = response.data.data.results;
                    $scope.masters.forEach(function(){
                        $scope.checkedMasters.push(false);
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

                    /*jshint camelcase: false */
                    $scope.totalPages = response.data.data.total_page_number;
                    $scope.currentPage = $scope.nextPage === 0 ? $scope.totalPages : $scope.nextPage - 1;

                    //Show pagination if required
                    if($scope.previousPage !== 0 || $scope.nextPage !== 0) {
                        $scope.showPagination = true;
                    }
                }
                else{
                    $scope.masters = [];
                }
            }, function(response) {
                switch(response.status) {
                    case 0:
                    case 500:
                        growl.error('Internal Server Error');
                    break;

                    case 401:
                        growl.error('Unauthorized access');
                    break;

                    case 404:
                        growl.error('Invalid URL');
                    break;

                    case 400:
                        switch(response.data.error[0]) {
                            case 'token_not_provided':
                                growl.error('Token not provided');
                            break;
                        }
                    break;
                }
            });
        };

        /**
         * Get the previous page of masters
         */
        $scope.getMastersPrev = function() {
            $scope.getMasters($scope.previousPage);
        };
        
        /**
         * Get the first page of masters
         */
        $scope.getMastersFirst = function() {
            $scope.getMasters(1);
        };

        /**
         * Get the next page of masters
         */
        $scope.getMastersNext = function() {
            $scope.getMasters($scope.nextPage);
        };

        /**
         * Get the last page of masters
         */
        $scope.getMastersLast = function() {
            $scope.getMasters($scope.totalPages);
        };

        /**
         * Accept the form data and add the master
         * @param {object} master The master data to be added
         */
        $scope.addMaster = function(master) {
            SaltMasterService.addMaster(master)
            .then(function() {
                //Show notice and reload the current view
                growl.success('Master created successfully');
                $state.go('salt.dashboard.settings.masters.list', {}, { reload: true });
            }, function(response) {
                switch (response.status) {
                    case 0:
                    case 500:
                        growl.error('Unknown server error');
                    break;

                    case 401:
                        if(response.data.error[0] === 'no_route_to_host') {
                            growl.error('Master not reachable');
                        } else {
                            growl.error('Unauthorized access');
                        }
                    break;

                    case 400:
                        if(response.data.error[0] === 'no_route_to_host') {
                            growl.error('Master not reachable');
                        } else if('duplicate_master') {
                            growl.error('FQDN already exists');
                        } else {
                            growl.error('Invalid credentials');
                        }
                    break;

                    default:
                        growl.error('Something went wrong');
                    break;
                }
                master = {};
            });
        };

        /**
         * Single master details
         * @param {string} hostname The hostname of the master to be displayed
         * @param {boolean} editMaster Whether the master is fetched for edit
         */
        $scope.showMaster = function(hostname, editMaster) {
            SaltMasterService.getMaster(hostname)
            .then(function(response) {
                if(response.data.data.count > 0) {
                    //Set currently displayed single master
                    SaltMasterService.setCurrent(response.data.data.results[0]);

                    if(editMaster === 'edit'){
                        //Current edited master
                        $scope.currentMasterEdit = response.data.data.results[0];
                        $scope.currentMasterEdit.originalHostname = $scope.currentMasterEdit.hostname;
                    } else {
                        $scope.selectedRow = editMaster;
                        $scope.currentMasterDisplayed = response.data.data.results[0];

                        /*jshint camelcase: false */
                        $scope.userDetails = $scope.currentMasterDisplayed.mastertoken_set;
                        $scope.userName = $scope.userDetails[0];
                    }
                }
            }, function(response) {
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
         * Select/De-select all masters
         */
        $scope.selectAll = function() {
            //Select all
            if(!$scope.selectedAll) {
                for(var i = 0; i < $scope.masters.length; i++) {
                    $scope.checkedMasters[i] = true;
                }
                $scope.selectedMasters = lodash.pluck($scope.masters, 'hostname');
                $scope.selectedAll = true;
            }
            //Deselect all
            else {
                for(var j = 0; j < $scope.masters.length; j++) {
                    $scope.checkedMasters[j] = false;
                }
                $scope.selectedMasters = [];
                $scope.selectedAll = false;
            }
        };

        /**
         * Select masters for delete
         * @param {string} hostname The hostname of the master to be deleted
         */
        $scope.selectMaster = function(index, hostname) {
            $scope.checkedMasters[index] = $scope.checkedMasters[index]? false : true;
            //Check if the hostname exists
            index = lodash.indexOf($scope.selectedMasters, hostname);

            //If not, add it
            if(index === -1) {
                $scope.selectedMasters.push(hostname);
                if($scope.selectedMasters.length === $scope.masters.length) {
                    $scope.selectedAll = true;
                }
            }
            //Else remove it
            else {
                $scope.selectedMasters.splice(index, 1);
                $scope.selectedAll = false;
            }
        };

        /**
         * Delete masters confirmation modal
         */
        $scope.confirmDelete = function() {
            if($scope.masters.length === 0) {
                growl.warning('Please add master');
                return false;
            } else if($scope.selectedMasters.length === 0) {
                growl.warning('Please select atleast one master');
                return false; 
            }

            //Create
            $scope.confirmDeleteModal = $modal.open({
                templateUrl : 'views/dialogs/confirmDeleteMasters.html',
                scope       : $scope,
                backdrop    : 'static'
            });

            //Accept
            $scope.confirmDeleteOk = function() {
                $scope.confirmDeleteModal.close();
            };

            //Reject
            $scope.confirmDeleteCancel = function() {
                $scope.confirmDeleteModal.dismiss();
            };

            //Handle promise
            $scope.confirmDeleteModal.result.then(function() {
                $scope.deleteMasters();
            }, function() {
                //Nothing
            });
        };

        /**
         * Delete the selected masters
         */
        $scope.deleteMasters = function() {
            var selected = {};
            for(var i = 1; i <= $scope.selectedMasters.length; i++){
                selected['h'+i] = $scope.selectedMasters[i - 1];
            }

            //Send the masters list to the server for deletion
            SaltMasterService.deleteMasters(selected)
            .then(function(response) {
                if(response.status === 200) {
                	growl.success('Selected masters deleted');
                    $state.go($state.current, {}, {reload: true});
                    $scope.selectedMasters = [];
                }
            }, function() {
            	growl.error('Internal Server Error');
            });
        };

        /**
         * Edit a master
         * @param {object} master The master data to be edited
         */
        $scope.editMaster = function(master) {
            //Remove master token set
            /*jshint camelcase: false */
            delete master.mastertoken_set;

            SaltMasterService.editMaster(master)
            .then(function() {
                $state.go('salt.dashboard.settings.masters.list', {}, {reload: true});
            }, function(response) {
                switch(response.status) {
                    case 0:
                    case 500:
                        growl.error('Unknown server error');
                    break;

                    case 400:
                        growl.error('Incorrect data provided');
                    break;

                    case 401:
                        if(response.data.error[0] === 'invalid_master_credentials') {
                            growl.error('Invalid credentials');
                        } else if(response.data.error[0] === 'no_route_to_host') {
                            growl.error('Master not reachable');
                        }
                    break;

                    default:
                        growl.error('Something went wrong');
                    break;                    
                }
            });
        };

        switch($state.current.name) {
            case 'salt.dashboard.resources.masters':
            case 'salt.dashboard.settings.masters.list':
            	$scope.mode = $stateParams.view === 'grid' ? 2 : 1;
                $scope.getMasters();
            break;

            case 'salt.dashboard.resources.masters.detail':
                //If the hostname is not specified, then redirect to masters list
                if(typeof $state.params.hostname !== 'undefined' && $state.params.hostname !== '' ) {
                    hostname = $state.params.hostname;
                    $scope.showMaster(hostname);
                }
                $scope.getMasters();
            break;

            case 'salt.dashboard.settings.masters.edit':
                //If the hostname is not specified, then redirect to masters list
                if(typeof $state.params.masterId !== 'undefined' && $state.params.masterId !== '' ) {
                    hostname = $state.params.masterId;
                    $scope.showMaster(hostname, 'edit');
                }
            break;
        }
    }]);

'use strict';

/**
 * @ngdoc directive
 * @name sseFeApp.directive:sidebar
 * @description
 * # sidebar
 */
angular.module('sseFeApp')
    .directive('sidebar',['$location', function (location) {
        return {
            templateUrl : 'views/directives/sidebar.html',
            restrict    : 'E',
            link        : function postLink(scope) {
                //scope, element, attrs
                scope.setActiveClass = function(current) {			
                    if (current !== location.$$url) {                    	
                        return '';
                    }
                    return 'active';
                };
            },

            controller: function($scope){
                $scope.isOpen = false;
            }
        };
    }]);

'use strict';

/**
 * @ngdoc directive
 * @name sseFeApp.directive:mastersList
 * @description # mastersList
 */
angular.module('sseFeApp').directive('mastersList', function() {
    return {
        templateUrl : 'views/mastersList.html',
        restrict : 'E',
        link : function postLink() {
            // scope, element, attrs
            // Coming soon
        }
    };
});

'use strict';

/**
 * @ngdoc service
 * @name sseFeApp.SaltMasterService
 * @description # SaltMasterService Factory in the sseFeApp.
 */
angular.module('sseFeApp')
    .factory('SaltMasterService', ['$http', '$q', 'SaltUrlService', 'SaltConfig', function($http, $q, SaltUrlService, SaltConfig) {
        /* Get all the urls for master */
        var _urls = SaltUrlService.getUrls('master'),
            _currentMaster = {};

        /**
         * Public methods
         * Following the CRUD order
         */
        return {

            /**
             * Add a master with the details provided
             * @param {object} master Details collected from the form
             * @return {object} $http Promise for the Ajax call
             */
            addMaster: function(master) {
                var config = {
                        method: 'post',
                        url: _urls.add,
                        headers: { AUTHORIZATION : 'Token ' + SaltConfig.getUser().token },
                        data: master
                    };

                return $http(config);
            },

            /**
             * Get all the masters available
             * @param {object} params Pagination parameters
             * @return {object} $http Promise for the Ajax call
             */
            getMasters : function(params) {
                var config = {
                        method: 'get',
                        url: _urls.all,
                        headers: { AUTHORIZATION : 'Token ' + SaltConfig.getUser().token },
                        params: params
                    };

                return $http(config);
            },

            /**
             * Get a master
             * @param {string} hostname Hostname of the desired master
             * @return {object} $http Promise for the Ajax call
             */
            getMaster : function(hostname) {
                var config = {
                        method: 'get',
                        url: _urls.one + hostname + '/',
                        headers: { AUTHORIZATION : 'Token ' + SaltConfig.getUser().token }
                    };

                return $http(config);
            },

            /**
             * Edit a master
             * @param {object} master New details for the master being edited
             * @return {object} $http Promise for the Ajax call
             */
            editMaster: function(master) {
                var config = {
                        method: 'post',
                        url: _urls.edit + master.originalHostname + '/edit/',
                        headers: { AUTHORIZATION : 'Token ' + SaltConfig.getUser().token },
                        data: master
                    };

                return $http(config);
            },

            /**
             * Delete masters by ids
             * @param {object} hostnames Key value pairs to send masters ids as an object
             * @return {object} $http Promise for the Ajax call
             */
            deleteMasters : function(hostnames) {
                var config = {
                        method: 'post',
                        url: _urls.remove,
                        headers: { AUTHORIZATION : 'Token ' + SaltConfig.getUser().token },
                        data: hostnames
                    };

                return $http(config);
            },

            /**
             * Set a master for viewing
             */
            setCurrent: function(master) {
                _currentMaster = master;
            },

            /**
             * Get a master for viewing
             */
            getCurrent: function() {
                return _currentMaster;
            }
        };
    }]);

'use strict';

/**
 * @ngdoc directive
 * @name sseFeApp.directive:ajaxLoader
 * @description # ajaxLoader
 */
angular.module('sseFeApp').directive('ajaxLoader', function() {
    return {
        templateUrl : 'views/directives/ajaxLoader.html',
        restrict : 'E',
        link : function postLink(scope, element) {
            scope.$on('loader_show', function() {
                element.show();
            });

            scope.$on('loader_hide', function() {
                element.hide();
            });
        }
    };
});

'use strict';

/**
 * @ngdoc directive
 * @name sseFeApp.directive:rightbar
 * @description # rightbar
 */
angular.module('sseFeApp')
    .directive('rightbar', function() {
        return {
            templateUrl : 'views/directives/rightbar.html',
            restrict : 'E',
            scope : false,
            link: function() {
                //scope, elem, attr
            },
        };
});
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

'use strict';

/**
 * @ngdoc service
 * @name sseFeApp.Saltuserservice
 * @description
 * # Saltuserservice
 * Service in the sseFeApp.
 */
angular.module('sseFeApp')
    .factory('SaltUserService', ['$http', '$q', 'SaltUrlService', 'SaltConfig', function($http, $q, SaltUrlService, SaltConfig) {
        /* Get all the urls for user */
        var _urls = SaltUrlService.getUrls('user'),
            _currentUser = {};

        /**
         * Public methods
         * Following the CRUD order
         */
        return {

            /**
             * Add a user with the details provided
             * @param {object} user Details collected from the form
             * @return {object} $http Promise for the Ajax call
             */
            addUser : function(user){
                var config = {
                        method: 'post',
                        url: _urls.add,
                        headers: { AUTHORIZATION : 'Token ' + SaltConfig.getUser().token },
                        data: user
                    };

                return $http(config);
            },

            /**
             * Get all the users available
             * @param {object} params Pagination parameters
             * @return {object} $http Promise for the Ajax call
             */
            getUsers : function(params){
                var config = {
                        method: 'get',
                        url: _urls.all,
                        headers: { AUTHORIZATION : 'Token ' + SaltConfig.getUser().token },
                        params: params
                    };

                return $http(config);
            },

            /**
             * Get a user
             * @param {string} user Id of the desired user
             * @return {object} $http Promise for the Ajax call
             */
            getUser: function(user) {
                var config = {
                        method: 'get',
                        url: _urls.one + user + '/',
                        headers: { AUTHORIZATION : 'Token ' + SaltConfig.getUser().token }
                    };

                return $http(config);
            },

            /**
             * Edit a user
             * @param {object} user New details for the user being edited
             * @return {object} $http Promise for the Ajax call
             */
            editUser : function(user){
                var config = {
                        method: 'post',
                        url: _urls.edit + user.id + '/edit/',
                        headers: { AUTHORIZATION : 'Token ' + SaltConfig.getUser().token },
                        data: user
                    };

                return $http(config);
            },

            /**
             * Delete users by ids
             * @param {object} users Key value pairs to send user ids as an object
             * @return {object} $http Promise for the Ajax call
             */
            deleteUsers : function(users){
                var config = {
                        method: 'post',
                        url: _urls.remove,
                        headers: { AUTHORIZATION : 'Token ' + SaltConfig.getUser().token },
                        data: users
                    };

                return $http(config);
            },

            /**
             * Set a user for viewing
             */
            setCurrentUser : function(user){
                _currentUser = user;
            },

            /**
             * Get a user for viewing
             */
            getCurrentUser : function(){
                return _currentUser;
            }
        };
    }]);

'use strict';

/**
 * @ngdoc function
 * @name sseFeApp.controller:MinionsctrlCtrl
 * @description
 * # MinionsctrlCtrl
 * Controller of the sseFeApp
 */
angular.module('sseFeApp')
    .controller('MinionsCtrl', ['$scope', '$rootScope', 'SaltMinionService', '$timeout', '$state', '$stateParams', 'lodash', '$modal', 'growl', function($scope, $rootScope, SaltMinionService, $timeout, $state, $stateParams, lodash, $modal, growl) {
        /*jshint camelcase: false */
        $scope.selectedMinions = [];
        $scope.previousPage = 0;
        $scope.nextPage = 0;
        $scope.nextQtPage = 0;
        $scope.previousQtPage = 0;
        $scope.nextTPage = 0;
        $scope.previousTPage = 0;
        $scope.previousHistoryPage = 0;
        $scope.nextHistoryPage = 0;
        $scope.previousMinionHistoryPage = 0;
        $scope.nextMinionHistoryPage = 0;
        $scope.addToTargetModal = {};
        $scope.deleteQTModal = {};
        $scope.saveTextFilterModal = {};
        $scope.saveGrainsFilterModal = {};
        $scope.targetFolder = 'Please select a folder';
        $scope.selectedAll = false;
        $scope.targetSelectedAll = false;
        $scope.checkedMinions = [];
        $scope.showPagination = false;
        $scope.showQtPagination = false;
        $scope.showTPagination = false;
        $scope.target =[];
        $scope.target.is_fav = true;
        $scope.activeApply = true;
        $scope.minionsFiltered = false;
        $scope.currentFilter = {};
        $scope.stateParams = $stateParams;
        $scope.jobHistoryList = [];
        $scope.minionsJobHistory = [];
        $scope.loadingMessage = 'No job history for these minions.';
        $scope.currentPage = 1;

        var dataDict;
        
        /**
         * Get Target Minions Job History
         */
        $scope.getTargetJobHistory = function(historyPage) {
            var historyParams = {};
            $scope.loadingMessage = 'Please wait...';

            //Set page number if available
            if(typeof historyPage !== 'undefined') {
                historyParams.page = historyPage;
            }

            //Get all minions history on load
            SaltMinionService.getTargetJobHistory($state.params.targetId, historyParams)
            .then(function(response) {
                if(response.data.data.count > 0) {
                    $scope.jobHistoryList = response.data.data.results;
                    //$scope.totalHistory = response.data.data.count;

                    //Next and previous page numbers
                    $scope.nextHistoryPage = (response.data.data.next_page_number !== null) ? response.data.data.next_page_number : 0;
                    $scope.previousHistoryPage = (response.data.data.previous_page_number !== null) ? response.data.data.previous_page_number : 0;

                    //Show pagination if required
                    if($scope.previousHistoryPage !== 0 || $scope.nextHistoryPage !== 0) {
                        $scope.showPagination = true;
                    } else {
                        $scope.showPagination = false;
                    }
                } else {
                    $scope.historyList = [];
                    $scope.loadingMessage = 'No job history for this target.';
                }
            }, function(response) {
                switch(response.status) {
                    case 0:
                    case 500:
                        $scope.minionsError = 'Server Error.';
                    break;

                    case 401:
                        growl.error('Invalid token provided.');
                    break;

                    case 400:
                        if(response.data.error[0] === 'token_expired') {
                            growl.error('Token expired');
                        } else {
                            growl.error('Internal Server Error');
                        }
                    break;
                }
            });
        };

        /**
         * Get target job history next
         */
        $scope.getTargetJobHistoryNext = function() {
            $scope.getTargetJobHistory($scope.nextHistoryPage);
        };

        /**
         * Get target job history prev
         */
        $scope.getTargetJobHistoryPrev = function() {
            $scope.getTargetJobHistory($scope.previousHistoryPage);
        };

        /**
         * Get Minions
         * @param {number} minionsPage Page number
         */
        $scope.getMinions = function(minionsPage) {
            var minionsParams = {}, parameter;

            //Set page number if available
            if(typeof minionsPage !== 'undefined') {
                minionsParams.page = minionsPage;
            }

            //For a prticular master
            if(typeof $scope.minionsForMaster !== 'undefined' && $scope.minionsForMaster !== '') {
                minionsParams.mid = $scope.minionsForMaster;
            }

            //Set sorting parameter if set
            if(typeof $scope.sortingParameter !== 'undefined') {
                if($scope.sortingOrder === 'desc') {
                    parameter = '-' + $scope.sortingParameter;
                } else {
                    parameter = $scope.sortingParameter;
                }
                minionsParams.ordering = parameter;
            }

            //Get all minions on load
            SaltMinionService.getMinions(minionsParams)
            .then(function(response) {
                if(response.data.data.count > 0) {
                    $scope.minions = response.data.data.results;
                    $scope.totalMinions = response.data.data.count;
                    $scope.minions.forEach(function(){
                        $scope.checkedMinions.push(false);
                    });

                    //Next and previous page numbers
                    $scope.nextPage = (response.data.data.next_page_number !== null) ? response.data.data.next_page_number : 0;
                    $scope.previousPage = (response.data.data.previous_page_number !== null) ? response.data.data.previous_page_number : 0;
                    $scope.totalPages = response.data.data.total_page_number;
                    $scope.currentPage = $scope.nextPage === 0 ? $scope.totalPages : $scope.nextPage - 1;

                    //Show pagination if required
                    if($scope.previousPage !== 0 || $scope.nextPage !== 0) {
                        $scope.showPagination = true;
                    } else {
                        $scope.showPagination = false;
                    }
                }
            }, function(response) {
                switch(response.status) {
                    case 0:
                    case 500:
                        $scope.minionsError = 'Server Error.';
                    break;

                    case 401:
                        growl.error('Invalid token provided.');
                    break;

                    case 400:
                        if(response.data.error[0] === 'token_expired') {
                            growl.error('Token expired');
                        } else {
                            growl.error('Internal Server Error');
                        }
                    break;
                }
            });
        };

        /**
         * Get the previous page of minions
         */
        $scope.getMinionsPrev = function() {
            if($scope.minionsFiltered === false) {
                $scope.getMinions($scope.previousPage);
            } else {
                $scope.applyFilter($scope.previousPage);
            }
        };

        /**
         * Get the first page of minions
         */
        $scope.getMinionsFirst = function() {
            if($scope.minionsFiltered === false) {
                $scope.getMinions(1);
            } else {
                $scope.applyFilter(1);
            }
        };
        
        /**
         * Get the next page of minions
         */
        $scope.getMinionsNext = function() {
            if($scope.minionsFiltered === false) {
                $scope.getMinions($scope.nextPage);
            } else {
                $scope.applyFilter($scope.nextPage);
            }
        };

        /**
         * Get the last page of minions
         */
        $scope.getMinionsLast = function() {
            if($scope.minionsFiltered === false) {
                $scope.getMinions($scope.totalPages);
            } else {
                $scope.applyFilter($scope.totalPages);
            }
        };
        
        /**
         * Set sorting parameter
         */
        $scope.setSortingParameter = function(parameter) {
            $scope.sortingParameter = parameter;
            $scope.sortingOrder = $scope.sortingOrder === 'desc' ? 'asc' : 'desc';
            $scope.sortingBy = parameter + '-' + $scope.sortingOrder;
            if($scope.minionsFiltered === false) {
                if($state.current.name === 'salt.dashboard.resources.quicktargets'){
                    $scope.getQtMinions();
                } else if($state.current.name === 'salt.dashboard.resources.targets'){
                    $scope.getTargetMinions();
                } else if($state.current.name === 'salt.dashboard.resources.minions'){
                    $scope.getMinions();
                } 
            } else {
                $scope.applyFilter();
            }
        };

        /**
         * Show single minion
         */
        $scope.getMinion = function(minionId) {
            SaltMinionService.getMinion(minionId)
            .then(function(response) {
                if(response.data.data.count > 0) {
                    $scope.currentMinionDisplayed = response.data.data.results[0];
                    $scope.getMinionJobDetails(minionId);
                }
            }, function(response) {
                switch(response.status) {
                    case 0:
                    case 500:
                        growl.error('Internal Server Error');
                    break;

                    case 401:
                        growl.error('Invalid token');
                    break;
                    
                    case 404:
                        growl.error('Invalid url');
                    break;
                }
            });

        };
        
        /**
         * Get Minion Job Details
         */
        
        $scope.getMinionJobDetails = function(minionId) {
            SaltMinionService.getMinionJobs(minionId)
            .then(function(response) {
                if(response.data.data.count > 0) {
                    $scope.currentMinionDisplayedJobs = response.data.data.results;
                }
            }, function(response) {
                switch(response.status) {
                    case 0:
                    case 500:
                        growl.error('Internal Server Error');
                    break;

                    case 401:
                        growl.error('Invalid token');
                    break;
                    
                    case 404:
                        growl.error('Invalid url');
                    break;
                }
            });
        };

        /**
         * Reload minions
         */
        $scope.reDiscoverMinions = function(){
            SaltMinionService.refreshMinions()
            .then(function(response) {
                if(response.status === 200) {
                    growl.info('grains.items executed successfully. Page will refresh in 3 seconds.');
                    $timeout(function() {
                        $state.go($state.current, {}, {reload: true});
                    }, 3000);
                }
            }, function() {
                //TODO after Growl integration
            });
        };

        /**
         * Select all minions
         */
        $scope.selectAll = function() {
            //Select all
            if(!$scope.selectedAll) {
                for(var i = 0; i < $scope.minions.length; i++) {
                    $scope.checkedMinions[i] = true;
                }
                $scope.selectedMinions = lodash.pluck($scope.minions, 'id');
                $scope.selectedAll = true;
            }
            //Deselect all
            else {
                for(var j = 0; j < $scope.minions.length; j++) {
                    $scope.checkedMinions[j] = false;
                }
                $scope.selectedMinions = [];
                $scope.selectedAll = false;
            }

            $rootScope.selectedMinions = $scope.selectedMinions;
        };

        /**
         * Select minions for operations
         * @param {number} minionId Id if the minion selected
         */
        $scope.selectMinion = function(index, minionId) {
            $scope.checkedMinions[index] = $scope.checkedMinions[index]? false : true;
            minionId = parseInt(minionId, 10); //Typecast, very important!

            //Check if the minion id exists
            index = lodash.indexOf($scope.selectedMinions, minionId);

            //If not, add it
            if(index === -1) {
                $scope.selectedMinions.push(minionId);
                if($scope.selectedMinions.length === $scope.minions.length) {
                    $scope.selectedAll = true;
                }
            }
            //Else remove it
            else {
                $scope.selectedMinions.splice(index, 1);
                $scope.selectedAll = false;
            }
            
            $rootScope.selectedMinions = $scope.selectedMinions;
        };

        /**
         * Get Target Groups
         */
        
        $scope.getTargetGroups = function() {
            $scope.activeApply = false;
            var selected = $scope.getSelectedMinionsList();
            SaltMinionService.getMinionTargetGroups(selected)
            .then(function(response) {
                dataDict = response.data.data.data_dict;
                $scope.targetGroups = angular.copy(dataDict);
            }, function(response) {
                switch(response.status) {
                    case 0:
                    case 404:
                    case 500:
                        growl.error('Internal Server Error');
                    break;
    
                    case 401:
                        growl.error('Unauthorized access');
                    break;
    
                    case 400:
                        growl.error('No targets available');
                    break;
                }
            });

            $scope.checkBoxStatus = function() {
                if(angular.equals(dataDict,$scope.targetGroups)) {
                    $scope.activeApply = false;
                } else {
                    $scope.activeApply = true;
                }
            };

            $scope.sendTargetList = function() {
                SaltMinionService.modifyMinionTargetGroups($scope.targetGroups,selected)
                .then(function(){
                    growl.success('Target Group modified successfully');
                }, function(response) {
                switch(response.status) {
                    case 0:
                    case 404:
                    case 500:
                        growl.error('Internal Server Error');
                    break;
                    case 401:
                        growl.error('Unauthorized access');
                    break;
                    case 400:
                        growl.error('No targets available');
                    break;
                    }
                });
            };
        };

        /**
         * Get selected minions
         */
        $scope.getSelectedMinionsList = function() {
            var selected = {};
            for(var i = 1; i <= $scope.selectedMinions.length; i++){
                selected['m'+i] = $scope.selectedMinions[i - 1];
            }
            return selected;
        };

        /**
         * Add selected minions to Quicktarget
         */
        $scope.addMinionsToQuickTarget = function() {
            if($scope.selectedMinions.length === 0) {
                growl.warning('Please select atleast one minion.');
                return;
            }

            var selected = {};
            for(var i = 1; i <= $scope.selectedMinions.length; i++){
                selected['m'+i] = $scope.selectedMinions[i - 1];
            }

            SaltMinionService.addToQuickTarget(selected)
            .then(function(response) {
                //Update count in the menu item
                $scope.$emit('quickTargetCountUpdate', response.data.data.total_minion);
                /*jshint camelcase: false */
                growl.success($scope.selectedMinions.length + ' Minions added to Quick Target');
            }, function(response) {
                switch(response.status) {
                    case 0:
                    case 500:
                        growl.error('Internal Server Error');
                    break;

                    case 401:
                        growl.error('Unauthorized access');
                    break;

                    case 400:
                        growl.error('No minions available');
                    break;
                }
            });
        };

        /**
         * Get quick target minions
         */
        $scope.getQtMinions = function(qtPage) {
            var qtParams = {},
                parameter;

            //Set page number if available
            if(typeof qtPage !== 'undefined') {
                qtParams.page = qtPage;
            }

            //Set sorting parameter if set
            if(typeof $scope.sortingParameter !== 'undefined') {
                if($scope.sortingOrder === 'desc') {
                    parameter = '-' + $scope.sortingParameter;
                } else {
                    parameter = $scope.sortingParameter;
                }
                qtParams.ordering = parameter;
            }

            //List Quick Targets
            SaltMinionService.getQuickTargetMinions(qtParams)
            .then(function(response) {
                if(response.data.data.count > 0) {
                    $scope.minions = response.data.data.results;
                    $scope.qtId = response.data.data.tgt_id;
                    //Next anqd previous page numbers
                    $scope.nextQtPage = (response.data.data.next_page_number !== null) ? response.data.data.next_page_number : 0;
                    $scope.previousQtPage = (response.data.data.previous_page_number !== null) ? response.data.data.previous_page_number : 0;
                    $scope.totalQtPages = response.data.data.total_page_number;
                    $scope.currentQtPage = $scope.nextQtPage === 0 ? $scope.totalQtPages : $scope.nextQtPage - 1;

                    //Show pagination if required
                    if($scope.previousQtPage !== 0 || $scope.nextQtPage !== 0) {
                        $scope.showQtPagination = true;
                    }
                }
            }, function(response) {
                switch(response.status) {
                    case 401:
                        growl.error('Unauthorized access.');
                    break;

                    case 0:
                    case 500:
                        growl.error('Some error occurred.');
                    break;

                    case 404:
                        growl.error('Invalid url.');
                    break;
                }
            });
        };

        /**
         * Get previous page of quick target minions
         */
        $scope.getQtMinionsPrev = function() {
            $scope.getQtMinions($scope.previousQtPage);
        };

        /**
         * Get first page of quick target minions
         */
        $scope.getQtMinionsFirst = function() {
            $scope.getQtMinions(1);
        };

        /**
         * Get next page of quick target minions
         */
        $scope.getQtMinionsNext = function() {
            $scope.getQtMinions($scope.nextQtPage);
        };

        /**
         * Get last page of quick target minions
         */
        $scope.getQtMinionsLast = function() {
            $scope.getQtMinions($scope.totalQtPages);
        };

        /**
         * Create target from selected minions
         * @param {string} fromQt Create target from a quick target
         */
        $scope.addSelectedMinionsToTarget = function(fromQt) {
            if($scope.selectedMinions.length === 0) {
                growl.error('Please select atleast one minion.');
                return;
            }

            $scope.addToTarget(true, fromQt);
        };

        /**
         * Create target from all minions
         */
        $scope.addMinionsToTarget = function(fromQt) {
            $scope.addToTarget(false, fromQt);
        };

        /**
         * Add to target modal confirmation
         * @param {boolean} addSelected Add only selected minions
         * @param {string} fromQt Create target from a quick target
         */
        $scope.addToTarget = function(addSelected, fromQt) {
            //Create
            $scope.target.name = '';
            $scope.target.foldername = $scope.targetPrivateFolderStructure[0].name;
            $scope.target.parent_id = $scope.targetPrivateFolderStructure[0].id;
            $scope.target.is_fav = true;
            $scope.addToTargetModal = $modal.open({
                templateUrl : 'views/dialogs/confirmAddToTarget.html',
                scope       : $scope,
                backdrop    : 'static'
            });

            //Change on radio button selection
            $scope.radioBtnChange = function(boolean) {
                if(boolean) {
                    $scope.target.foldername = $scope.targetPrivateFolderStructure[0].name;
                    $scope.target.parent_id = $scope.targetPrivateFolderStructure[0].id;
                } else {
                    $scope.target.foldername = $scope.targetPublicFolderStructure[0].name;
                    $scope.target.parent_id = $scope.targetPublicFolderStructure[0].id;
                }
            };

            //Accept
            $scope.addToTargetOk = function(target) {
                //Blank name not allowed
                if(!target || !target.name) {
                    return;
                }

                var params = { target_name: target.name, is_user_favorite:true, parent_id: target.parent_id };
                if(target.is_fav) {
                    params.is_user_favorite = false;
                }

                if(addSelected === true) {
                    var selected = {};
                    for(var i = 1; i <= $scope.selectedMinions.length; i++){
                        selected['m'+i] = $scope.selectedMinions[i - 1];
                    }

                    params.minion_id_info = selected;
                }

                $scope.target = target;

                SaltMinionService.addToTarget(params, addSelected)
                .then(function(response) {
                    //Close modal
                    $scope.addToTargetModal.close();

                    if(fromQt) {
                        growl.success('Quick target successfully added to target: '+response.data.data.target_name);
                    } else {
                        growl.success('Selected minions successfully added to target: '+response.data.data.target_name);
                    }

                    //Delete quick target if required
                    if($scope.target.deleteqt) {
                        $scope.removeQuickTarget();
                    } else {
                        $state.go($state.current, {}, {reload: true});
                    }
                }, function(response) {
                    //Dismiss modal
                    $scope.addToTargetModal.dismiss();
                    if(response.status === 400) {
                        switch(response.data.error[0]) {
                            case 'duplicate_target_name':
                                growl.error('Target already exists.');
                            break;

                            case 'target_name_empty':
                                growl.error('Target name empty.');
                            break;

                            case 'quick_target_doesnot_exists':
                                growl.error('Quick target not available.');
                            break;

                            case 'minion_doesnot_exists':
                                growl.error('Minion doesn\'t exist.');
                            break;

                            case 'parent_not_selected':
                                growl.error('Please select a folder for the target.');
                            break;
                            
                            case 'target_exists_at_same_level':
                                growl.error('Target name exists at the same level.');
                            break;
                        }
                    } else if(response.status === 401) {
                        growl.error('Unauthorized access.');
                    } else {
                        growl.error('Some error occurred.');
                    }
                });

                //$scope.addToTargetModal.close();
            };

            //Reject
            $scope.addToTargetCancel = function() {
                $scope.addToTargetModal.dismiss();
            };
        };

        /**
         * Delete Quick Target
         */
        $scope.confirmDeleteQT = function() {
            //Create
            $scope.deleteQTModal = $modal.open({
                templateUrl : 'views/dialogs/confirmDelete.html',
                scope       : $scope,
                backdrop    : 'static'
            });

            //Accept
            $scope.confirmDeleteOk = function() {
                $scope.deleteQTModal.close();
            };

            //Reject
            $scope.confirmDeleteCancel = function() {
                $scope.deleteQTModal.dismiss();
            };

            //Handle promise
            $scope.deleteQTModal.result.then(function() {
                //If no minions selected, delete the quick target
                if($scope.selectedMinions.length === 0) {
                    $scope.removeQuickTarget();
                } else {
                    $scope.removeQuickTargetMinions();
                }
            }, function() {
                //Nothing
            });
        };

        /**
         * Delete Quick Target
         */
        $scope.removeQuickTarget = function() {
            SaltMinionService.deleteQuickTarget()
            .then(function() {
                $state.go($state.current, {}, {reload: true});
            });
        };

        /**
         * Remove minion from the current users quick target
         * @param {number} minionId Id of the minion to be removed
         */
        $scope.removeQuickTargetMinion = function(minionId) {
            SaltMinionService.removeQuickTargetMinion(minionId)
            .then(function() {
                growl.success('Minion removed from Quick Target.');
                $state.go($state.current, {}, {reload: true});
            }, function(response) {
                if(response.status === 400 ) {
                    switch(response.data.error[0]) {
                        case 'token_not_provided':
                            growl.error('Token not provided.');
                        break;

                        case 'minion_doesnot_exists':
                            growl.error('Minion doesn not exist.');
                        break;
                    }
                } else if(response.status === 401) {
                    growl.error('Invalid token provided.');
                } else {
                    growl.error('Some error occurred.');
                }
            });
        };

        /**
         * Delete selected Quick Target minions
         */
        $scope.removeQuickTargetMinions = function() {
            var selected = {};
            for(var i = 1; i <= $scope.selectedMinions.length; i++){
                selected['m'+i] = $scope.selectedMinions[i - 1];
            }

            SaltMinionService.deleteQuickTargetMinions(selected)
            .then(function() {
                growl.success('Selected minions removed from quick target.');
                $state.go($state.current, {}, {reload: true});
            }, function(response) {
                switch(response.status) {
                    case 0:
                    case 500:
                        growl.error('Server side error occurred.');
                    break;

                    case 401:
                        growl.error('Unauthorized access.');
                    break;

                    case 404:
                        growl.error('Invalid URL.');
                    break;

                    case 400:
                        if(response.data.error[0] === 'invalid_minions') {
                            growl.error('Invalid minions.');
                        }
                    break;

                    default:
                        growl.error('Some error occurred.');
                    break;
                }
            });
        };

        /**
         * Get target minions
         * @param {number} tPage Page number
         */
        $scope.getTargetMinions = function(tPage) {
            var tParams = {},
            parameter;

            //Set page number if available
            if(typeof tPage !== 'undefined') {
                tParams.page = tPage;
            }

            //Set sorting parameter if set
            if(typeof $scope.sortingParameter !== 'undefined') {
                if($scope.sortingOrder === 'desc') {
                    parameter = '-' + $scope.sortingParameter;
                } else {
                    parameter = $scope.sortingParameter;
                }
                tParams.ordering = parameter;
            }

              SaltMinionService.getTargetMinions($stateParams.targetId, tParams)
              .then(function(response) {
                  if(response.data.data.count > 0) {
                      $scope.minions = response.data.data.results;
                      $scope.currentTarget = response.data.data.target; 
                      //$scope.$parent.$parent.$parent.state.current.data.pageTitle = 'Minions - ' + $scope.currentTarget.name;

                      //Next and previous page numbers
                      $scope.nextTPage = (response.data.data.next_page_number !== null) ? response.data.data.next_page_number : 0;
                      $scope.previousTPage = (response.data.data.previous_page_number !== null) ? response.data.data.previous_page_number : 0;
                      $scope.totalTPages = response.data.data.total_page_number;
                      $scope.currentTPage = $scope.nextTPage === 0 ? $scope.totalTPages : $scope.nextTPage - 1;

                      //Show pagination if required
                      if($scope.previousTPage !== 0 || $scope.nextTPage !== 0) {
                          $scope.showTPagination = true;
                      }                      
                  }
              }, function(response) {
                  switch(response.status) {
                      case 0:
                      case 500:
                          growl.error('Some error occurred.');
                      break;

                      case 401:
                          growl.error('Invalid token provided.');
                      break;

                      case 404:
                          growl.error('Invalid url.');
                      break;
                  }
              });
        };

        /**
         * Get previous page of target minions
         */
        $scope.getTargetMinionsPrev = function() {
            $scope.getTargetMinions($scope.previousTPage);
        };

        /**
         * Get first page of target minions
         */
        $scope.getTargetMinionsFirst = function() {
            $scope.getTargetMinions(1);
        };

        /**
         * Get next page of target minions
         */
        $scope.getTargetMinionsNext = function() {
            $scope.getTargetMinions($scope.nextTPage);
        };

        /**
         * Get last page of target minions
         */
        $scope.getTargetMinionsLast = function() {
            $scope.getTargetMinions($scope.totalTPages);
        };

        $scope.tooltip = {
            'qtaddbtntitle': 'Hello Tooltip<br />This is a multiline message.',
            'checked': false
        };

        /**
         * Filters functionality
         */
        $scope.filteredBy = {};
        $scope.filterView = false;
        $scope.filtersDisplayed = false;
        $scope.filtersLabel = 'On';
        $scope.showText = false;
        $scope.showGrains = false;
        $scope.showSaved = true;
        $scope.textFilterCriteria = {};
        $scope.currentlyDisplayedFilter = 'None';
        $scope.filtersList = [];
        $scope.searchFields = [
           { label: 'Node Name', value: 1 },
           { label: 'Master', value: 2 },
           { label: 'Target Group', value: 3 },
           { label: 'IP Address', value: 4 }
        ];

        $scope.matchParams = [
            { label: 'Contains', value: 1 },
            { label: 'Does not contain', value: 2 },
            { label: 'Starts with', value: 3 },
            { label: 'Ends with', value: 4 },
            { label: 'Is', value: 5 }
        ];

        /**
         * List all the existing filters
         */
        $scope.listFilters = function() {
            SaltMinionService.listFilters()
            .then(function(response) {
                if(response.data.data.count > 0) {
                    $scope.filtersList = response.data.data.results;
                }
            }, function() {
                //TODO
            });
        };
        
        /**
         * Toggle filter view
         */
        $scope.toggleFilterView = function() {
            $scope.filterView = $scope.filterView ? false : true;
            $scope.clearFilter();
        };

        /**
         * Toggle filters display
         */
        $scope.toggleFiltersDisplay = function(which) {
            //If hidden, show and set the current tab active
            if(!$scope.filtersDisplayed) {
                $scope.filtersDisplayed = true;
                $scope.currentlyDisplayedFilter = which;
                $scope['show' + which + 'Filter']();
            } else {
                //If same tab, then hide
                if($scope.currentlyDisplayedFilter === which) {
                    $scope.filtersDisplayed = false;
                    if(!$scope.minionsFiltered) {
                        $scope.currentlyDisplayedFilter = 'None';
                        $scope.clearFilter();
                        $scope.filterListLabel = 'No filter';
                    }
                }
                //Else show
                else {
                    $scope.currentlyDisplayedFilter = which;
                    $scope['show' + which + 'Filter']();
                }
            }
        };

        /**
         * Toggle filter type to Text
         */
        $scope.showTextFilter = function() {
            if(!$scope.filtersDisplayed) {
                return false;
            }
            $scope.showText = true;
            $scope.showGrains = false;
            $scope.showSaved = false;
        };

        /**
         * Toggle filter type to Grains
         */
        $scope.showGrainsFilter = function() {
            if(!$scope.filtersDisplayed) {
                return false;
            }
            $scope.showText = false;
            $scope.showGrains = true;
            $scope.showSaved = false;
        };

        /**
         * Toggle filter type to Saved filters
         */
        $scope.showSavedFilter = function() {
            if(!$scope.filtersDisplayed) {
                return false;
            }
            $scope.showText = false;
            $scope.showGrains = false;
            $scope.showSaved = true;
        };

        /**
         * For pagination and sorting
         */
        $scope.applyFilter = function(page) {
            if($scope.currentFilter.search_type === 1) {
                $scope.applyTextFilter(page);
            } else {
                $scope.applyGrainsFilter(page);
            }
        };

        /**
         * Save text filter modal
         */
        $scope.saveTextFilterConfirm = function() {
            //If no criteria selected then warn the user
            if(lodash.size($scope.textFilterCriteria) === 0) {
                growl.info('Please select a combination');
                return;
            }

            //Create a modal for saving the filter
            $scope.saveTextFilterModal = $modal.open({
                templateUrl : 'views/dialogs/saveTextFilter.html',
                scope       : $scope,
                backdrop    : 'static'
            });

            //Save filter accept
            $scope.saveTextFilterOk = function(criteria) {
                //Normalize data
                $scope.saveTextFilterCriteria = {
                    filter_name: criteria.filter_name,
                    match_params: criteria.match_params.value,
                    search_field: criteria.search_field.value,
                    search_text: criteria.search_text,
                    search_type: 1
                };

                //Close the modal
                $scope.saveTextFilterModal.close();
            };

            //Cancel the operation
            $scope.saveTextFilterCancel = function() {
                $scope.saveTextFilterModal.dismiss();
            };

            //Handle the modal promise
            $scope.saveTextFilterModal.result.then(function() {
                $scope.saveTextFilter();
            }, function() {
                //Nothing
            });
        };

        /**
         * Save text filter
         */
        $scope.saveTextFilter = function() {
            SaltMinionService.saveTextFilter($scope.saveTextFilterCriteria)
            .then(function(response) {
                $scope.textFilterCriteria.filter_name = '';
                growl.success('Filter created: '+response.data.data.filter_name);
                $scope.listFilters();
            }, function(response) {
                switch(response.status) {
                    case 0:
                    case 500:
                        growl.error('Unknown server error');
                    break;

                    case 401:
                        growl.error('Unauthorized access');
                    break;

                    case 400:
                        if(response.data.error[0] === 'filter_name_exists') {
                            growl.error('Duplicate filter name');
                        } else if(response.data.error[0] === 'search_text_empty') {
                            growl.error('Please enter search text');
                        } else if(response.data.error[0] === 'filter_name_empty') {
                            growl.error('Please enter a name for the filter');
                        }
                    break;

                    default:
                        growl.error('Unknown error');
                    break;
                }
                
                //Reset the filter name
                $scope.textFilterCriteria.filter_name = '';
            });
        };

        /**
         * Apply a saved filter
         */
        $scope.applySelectedFilter = function() {
            if(typeof $scope.selectedFilter !== 'object') {
                growl.info('Please select a filter');
                return;
            }

            //Run the appropriate search based on the search type
            if($scope.selectedFilter.search_type === 1) {
                $scope.currentFilter = {
                    'in': $scope.selectedFilter.search_field,
                    'as': $scope.selectedFilter.match_parameters,
                    'text': $scope.selectedFilter.search_text,
                    'search_type': 1
                    
                };
                $scope.applyTextFilter();
            } else {
                $scope.currentFilter = JSON.parse($scope.selectedFilter.search_grains);
                $scope.currentFilter.search_type = 2;
                $scope.applyGrainsFilter();
            }

            $scope.minionsFiltered = true;
        };

        /**
         * Apply an unsaved text filter
         */
        $scope.applyLiveFilter = function() {
            //If no criteria mentioned, show a warning
            if(lodash.size($scope.textFilterCriteria) === 0) {
                growl.info('Please select a filtering criteria.');
                return;
            }

            $scope.currentFilter = {
                'in': $scope.textFilterCriteria.search_field.value,
                'as': $scope.textFilterCriteria.match_params.value ,
                'text': $scope.textFilterCriteria.search_text,
                'search_type': 1
            };

            $scope.applyTextFilter();
            $scope.minionsFiltered = true;
        };

        /**
         * Apply text filter on the minions
         */
        $scope.applyTextFilter = function(minionsPage) {
            var parameter;
            //Set page number if available
            if(typeof minionsPage !== 'undefined') {
                $scope.currentFilter.page = minionsPage;
            }

            //Set sorting parameter if set
            if(typeof $scope.sortingParameter !== 'undefined') {
                if($scope.sortingOrder === 'desc') {
                    parameter = '-' + $scope.sortingParameter;
                } else {
                    parameter = $scope.sortingParameter;
                }
                $scope.currentFilter.ordering = parameter;
            }

            //Use quicktarget or target id if filtering on them
            if($state.current.name === 'salt.dashboard.resources.quicktargets') {
                $scope.currentFilter.tgt_id = $scope.qtId;
            } else if($state.current.name === 'salt.dashboard.resources.targets') {
                $scope.currentFilter.tgt_id = $scope.currentTarget.id;
            }

            SaltMinionService.applyTextFilter($scope.currentFilter)
            .then(function(response) {
                if(response.data.data.count > 0) {
                    $scope.minions = response.data.data.results;
                    //Update Next and previous page numbers
                    $scope.nextPage = (response.data.data.next_page_number !== null) ? response.data.data.next_page_number : 0;
                    $scope.previousPage = (response.data.data.previous_page_number !== null) ? response.data.data.previous_page_number : 0;
                    $scope.totalPages = response.data.data.total_page_number;
                    $scope.currentPage = $scope.nextPage === 0 ? $scope.totalPages : $scope.nextPage - 1;
                } else {
                    $scope.minions = [];
                    $scope.nextPage = 0;
                    $scope.previousPage = 0;
                    $scope.totalPages = 0;
                    $scope.currentPage = 0;
                }

                //Show pagination if required
                if($scope.previousPage !== 0 || $scope.nextPage !== 0) {
                    $scope.showPagination = true;
                } else {
                    $scope.showPagination = false;
                }
            }, function(response) {
                switch(response.status) {
                    case 0:
                    case 500:
                        growl.error('Unknown server error');
                    break;

                    case 401:
                        growl.error('Unauthorized access');
                    break;

                    default:
                        growl.error('Some error occurred');
                    break;
                }
            });
        };

        /**
         * Change selected filter label
         */
        $scope.setSelectedFilterLabel = function() {
            if($scope.textFilterCriteria.search_field === undefined || $scope.textFilterCriteria.match_params === undefined) {
                $scope.filterListLabel = 'No filter';
            } else {
                $scope.filterListLabel = 'Custom filter';
            }
        };

        /**
         * Get the grains data
         */
        /*jshint unused:false*/
        $scope.getGrainsData = function() {
            SaltMinionService.getGrainsData()
            .then(function(response) {
                $scope.grainsData = response.data.data;
                $scope.grainsKeys = $scope.filterBlanks($scope.grainsData);
            }, function(response) {
                //TODO
            });
        };

        /**
         * Remove grains with no values
         */
        $scope.filterBlanks = function(data) {
            var nonBlanks = [];
            angular.forEach( data, function(value, key) {
                if(value.length > 0) {
                    nonBlanks.push(key);
                }
            });

            return nonBlanks;
        };

        /**
         * Normalize data
         */
        $scope.constructGrainsData = function() {
            $scope.grainsFilterData = {};

            //Format the data
            if($scope.grainsKeySelectedOne !== '' && $scope.grainsValueSelectedOne !== '') {
                //$scope.grainsFilterData[$scope.grainsKeySelectedOne] = $scope.grainsValueSelectedOne;
                $scope.grainsFilterData.grain1 = $scope.grainsKeySelectedOne;
                $scope.grainsFilterData.value1 = $scope.grainsValueSelectedOne;
            }

            if($scope.grainsKeySelectedTwo !== '' && $scope.grainsValueSelectedTwo !== '') {
                //$scope.grainsFilterData[$scope.grainsKeySelectedTwo] = $scope.grainsValueSelectedTwo;
                $scope.grainsFilterData.grain2 = $scope.grainsKeySelectedTwo;
                $scope.grainsFilterData.value2 = $scope.grainsValueSelectedTwo;
            }

            if($scope.grainsKeySelectedThree !== '' && $scope.grainsValueSelectedThree !== '') {
                //$scope.grainsFilterData[$scope.grainsKeySelectedThree] = $scope.grainsValueSelectedThree;
                $scope.grainsFilterData.grain3 = $scope.grainsKeySelectedThree;
                $scope.grainsFilterData.value3 = $scope.grainsValueSelectedThree;
            }
        };

        /**
         * Apply unsaved grains filter
         */
        $scope.applyLiveGrainsFilter = function() {
            //Normalize data
            $scope.constructGrainsData();

            //Set as currentFilter
            $scope.currentFilter = $scope.grainsFilterData;
            $scope.applyGrainsFilter();
        };

        /**
         * Apply grains filter
         */
        $scope.applyGrainsFilter = function(minionsPage) {
            var parameter;

            //Set page number if available
            if(typeof minionsPage !== 'undefined') {
                $scope.currentFilter.page = minionsPage;
            }

            //Set sorting parameter if set
            if(typeof $scope.sortingParameter !== 'undefined') {
                if($scope.sortingOrder === 'desc') {
                    parameter = '-' + $scope.sortingParameter;
                } else {
                    parameter = $scope.sortingParameter;
                }
                $scope.currentFilter.ordering = parameter;
            }

            //Pass target id or quick target id if on the targets page
            //Use quicktarget or target id if filtering on them
            if($state.current.name === 'salt.dashboard.resources.quicktargets') {
                $scope.currentFilter.tgt_id = $scope.qtId;
            } else if($state.current.name === 'salt.dashboard.resources.targets') {
                $scope.currentFilter.tgt_id = $scope.currentTarget.id;
            }

            //Apply filters
            SaltMinionService.applyGrainFilters($scope.currentFilter)
            .then(function(response) {
                if(response.data.data.count > 0) {
                    $scope.minions = response.data.data.results;

                    //Update Next and previous page numbers
                    $scope.nextPage = (response.data.data.next_page_number !== null) ? response.data.data.next_page_number : 0;
                    $scope.previousPage = (response.data.data.previous_page_number !== null) ? response.data.data.previous_page_number : 0;
                    $scope.totalPages = response.data.data.total_page_number;
                    $scope.currentPage = $scope.nextPage === 0 ? $scope.totalPages : $scope.nextPage - 1;
                } else {
                    $scope.minions = [];
                    $scope.nextPage = 0;
                    $scope.previousPage = 0;
                    $scope.totalPages = 0;
                    $scope.currentPage = 1;
                }

                //Show pagination if required
                if($scope.previousPage !== 0 || $scope.nextPage !== 0) {
                    $scope.showPagination = true;
                } else {
                    $scope.showPagination = false;
                }
            }, function(response) {
                switch(response.status) {
                    case 0:
                    case 500:
                        growl.error('Unknown server error');
                    break;

                    case 401:
                        growl.error('Unauthorized access');
                    break;

                    default:
                        growl.error('Some error occurred');
                    break;
                }
            });
        };

        /**
         * Save grains filter modal
         */
        $scope.saveGrainsFilterConfirm = function() {
            //Create a modal for saving the filter
            $scope.saveGrainsFilterModal =  $modal.open({
                templateUrl : 'views/dialogs/saveGrainsFilter.html',
                scope       : $scope,
                backdrop    : 'static'
            });

            //Save filter accept
            $scope.saveGrainsFilterOk = function(filterName) {
                //Normalize data
                $scope.constructGrainsData();

                $scope.saveGrainsFilterCriteria = {
                    filter_name: filterName,
                    search_grains: $scope.grainsFilterData,
                    search_type: 2
                };

                //Close the modal
                $scope.saveGrainsFilterModal.close();
            };

            //Cancel the operation
            $scope.saveGrainsFilterCancel = function() {
                $scope.saveGrainsFilterModal.dismiss();
            };

            //Handle the modal promise
            $scope.saveGrainsFilterModal.result.then(function() {
                $scope.saveGrainsFilter();
            }, function() {
                //Nothing
            });
        };

        /**
         * Save the grains filter
         */
        $scope.saveGrainsFilter = function() {
            SaltMinionService.saveGrainsFilter($scope.saveGrainsFilterCriteria)
            .then(function(response) {
                $scope.filter_name = '';
                growl.success('Filter created: '+response.data.data.filter_name);
                $scope.listFilters();
            }, function(response) {
                switch(response.status) {
                    case 0:
                    case 500:
                        growl.error('Unknown server error');
                    break;

                    case 401:
                        growl.error('Unauthorized access');
                    break;

                    case 400:
                        if(response.data.error[0] === 'filter_name_exists') {
                            growl.error('Duplicate filter name');
                        } else if(response.data.error[0] === 'search_text_empty') {
                            growl.error('Please enter search text');
                        } else if(response.data.error[0] === 'filter_name_empty') {
                            growl.error('Please enter a name for the filter');
                        }
                    break;

                    default:
                        growl.error('Unknown error');
                    break;
                }
            });
        };

        /**
         * Avoid duplicate selection
         */
        $scope.avoidDuplicateSelection = function(which) {
            switch(which) {
                case 1:
                    if($scope.grainsKeySelectedOne !== '' && ($scope.grainsKeySelectedOne === $scope.grainsKeySelectedTwo || $scope.grainsKeySelectedOne === $scope.grainsKeySelectedThree)) {
                        growl.error('Option already selected');
                        $scope.grainsKeySelectedOne = '';
                    }
                    $scope.grainsValueSelectedOne = '';
                break;

                case 2:
                    if($scope.grainsKeySelectedTwo !== '' && ($scope.grainsKeySelectedTwo !== '' && $scope.grainsKeySelectedTwo === $scope.grainsKeySelectedOne || $scope.grainsKeySelectedTwo === $scope.grainsKeySelectedThree)) {
                        growl.error('Option already selected');
                        $scope.grainsKeySelectedTwo = '';
                    }
                    $scope.grainsValueSelectedTwo = '';
                break;

                case 3:
                    if($scope.grainsKeySelectedThree !== '' && ($scope.grainsKeySelectedThree !== '' && $scope.grainsKeySelectedThree === $scope.grainsKeySelectedOne || $scope.grainsKeySelectedThree === $scope.grainsKeySelectedTwo)) {
                        growl.error('Option already selected');
                        $scope.grainsKeySelectedThree = '';
                    }
                    $scope.grainsValueSelectedThree = '';
                break;
            }

            if($scope.grainsKeySelectedOne === '' && $scope.grainsKeySelectedTwo === '' && $scope.grainsKeySelectedThree === '' && $scope.grainsValueSelectedOne === '' && $scope.grainsValueSelectedTwo === '' && $scope.grainsValueSelectedThree === '') {
                $scope.filterListLabel = 'No filter';
                $scope.grainFilterFormValid = false;
            } else {
                $scope.filterListLabel = 'Custom filter';
            }
        };

        /**
         * Validation for filter form
         */
        $scope.grainFilterFormValid = false;
        $scope.validateForm = function(which) {
            if($scope['grainsValueSelected' + which] !== null) {
                $scope.grainFilterFormValid= true;
            } else {
                $scope.grainFilterFormValid= false;
            }
        };

        $scope.filterListLabel = 'No filter';
        $scope.sampleSelectedFilter = function(selected) {
            $scope.filterListLabel = selected.filter_name;
            $scope.filtersDisplayed = true;
            if(selected.search_type === 1) {
                $scope.currentlyDisplayedFilter = 'Text';

                //Populate the text search form
                $scope.textFilterCriteria.search_field = lodash.find($scope.searchFields, function(field) { return field.value === selected.search_field; });
                $scope.textFilterCriteria.match_params = lodash.find($scope.matchParams, function(param) { return param.value === selected.match_parameters; });
                $scope.textFilterCriteria.search_text = selected.search_text;

                $scope.showTextFilter();
            } else {
                $scope.resetGrainFiltersForm();

                $scope.currentlyDisplayedFilter = 'Grains';
                var parsedGrains = JSON.parse(selected.search_grains);

                if(typeof parsedGrains.grain1 !== 'undefined') {
                    $scope.grainsKeySelectedOne = parsedGrains.grain1;
                    $scope.grainsValueSelectedOne = parsedGrains.value1;
                }

                if(typeof parsedGrains.grain2 !== 'undefined') {
                    $scope.grainsKeySelectedTwo = parsedGrains.grain2;
                    $scope.grainsValueSelectedTwo = parsedGrains.value2;
                }

                if(typeof parsedGrains.grain3 !== 'undefined') {
                    $scope.grainsKeySelectedThree = parsedGrains.grain3;
                    $scope.grainsValueSelectedThree = parsedGrains.value3;
                }

                $scope.grainFilterFormValid = true;
                $scope.showGrainsFilter();
            }
        };

        /**
         * Reset text filter form
         */
        $scope.resetTextFiltersForm = function() {
            $scope.textFilterCriteria = {};
        };

        /**
         * Reset grain filter form
         */
        $scope.resetGrainFiltersForm = function() {
            //Reset grains filters
            $scope.grainsKeySelectedOne = '';
            $scope.grainsValueSelectedOne = '';
            $scope.grainsKeySelectedTwo = '';
            $scope.grainsValueSelectedTwo = '';
            $scope.grainsKeySelectedThree = '';
            $scope.grainsValueSelectedThree = '';
        };

        /**
         * Clear currently applied filters and get all minions
         */
        $scope.clearFilter = function() {
            //Minions are not filtered anymore
            $scope.minionsFiltered = false;
            $scope.filtersDisplayed = false;
            $scope.currentlyDisplayedFilter = 'None';
            $scope.filterListLabel = 'No filter';

            //Reset the selected filter
            $scope.selectedFilter = '';

            //Reset text filters
            $scope.resetTextFiltersForm();

            //Reset grain filters
            $scope.resetGrainFiltersForm();

            //The grain filter form is invalid now
            $scope.grainFilterFormValid = false;

            //Get non-filtered minions
            
            //State based function call
            if($state.current.name === 'salt.dashboard.resources.quicktargets') {
                $scope.getQtMinions();
            } else if($state.current.name === 'salt.dashboard.resources.targets') {
                $scope.getTargetMinions();
            } else {
                $scope.getMinions();
            }
        };

        /**
         * Get job history for selected minions
         */
        $scope.getMinionsJobHistory = function(historyPage) {
            if(!$rootScope.selectedMinions || $rootScope.selectedMinions.length === 0) {
                return;
            }

            //Form url params object
            var params = {};

            //Set page number if available
            if(typeof historyPage !== 'undefined') {
                params.page = historyPage;
            }

            params.mids = $rootScope.selectedMinions.join();
            $scope.loadingMessage = 'Please wait...';

            SaltMinionService.getMinionsJobHistory(params)
            .then(function(response) {
                if(response.data.data.count > 0) {
                    $scope.minionsJobHistory = response.data.data.results;
                } else {
                    $scope.loadingMessage = 'No job history for these minions.';
                }
            }, function(response) {
                switch(response.status) {
                    case 0:
                    case 500:
                        growl.error('Unknown server error');
                    break;

                    case 401:
                        growl.error('Unauthorized access');
                    break;

                    case 404:
                        growl.error('Invalid URL');
                    break;
                    
                    case 400:
                        growl.error('Unknown error');
                    break;
                }
            });
        };

        $scope.getMinionsJobHistoryNext = function() {
            $scope.getMinionsJobHistory($scope.nextMinionHistoryPage);
        };

        $scope.getMinionsJobHistoryPrevious = function() {
            $scope.getMinionsJobHistory($scope.previousMinionHistoryPage);
        };

        /**
         * Get length of object
         */
        $scope.getObjectLength = function(obj){
            return lodash.size(obj);
        };

        /**
         * Call function based on statuses
         */
        switch($state.current.name) {
            case 'salt.dashboard.resources.minions':
            	$scope.mode = $stateParams.view === 'grid' ? 2 : 1;
                $scope.getMinions();
                $scope.listFilters();
                $scope.getGrainsData();
            break;

            case 'salt.dashboard.resources.minions.master':
                $scope.minionsForMaster = $state.params.masterId;
                $scope.getMinions();
            break;

            case 'salt.dashboard.resources.minions.detail':
                $scope.mode = $stateParams.view === 'grid' ? 2 : 1;
                if(typeof $state.params.minionId !== 'undefined' && $state.params.minionId !== '') {
                    $scope.getMinion($state.params.minionId);
                }
                $scope.getMinions();
            break;

            case 'salt.dashboard.resources.targets.minions':
                $scope.mode = $stateParams.view === 'grid' ? 2 : 1;
                if(typeof $state.params.minionId !== 'undefined' && $state.params.minionId !== '') {
                    $scope.getMinion($state.params.minionId);
                }
                $scope.getTargetMinions();
            break;

            case 'salt.dashboard.resources.quicktargets.minions':
                $scope.mode = $stateParams.view === 'grid' ? 2 : 1;
                if(typeof $state.params.minionId !== 'undefined' && $state.params.minionId !== '') {
                    $scope.getMinion($state.params.minionId);
                }
                $scope.getQtMinions();
            break;

            case 'salt.dashboard.resources.quicktargets':
            	$scope.mode = $stateParams.view === 'grid' ? 2 : 1;
                $scope.getQtMinions();
                $scope.listFilters();
                $scope.getGrainsData();
            break;

            case 'salt.dashboard.resources.targets':
                $scope.mode = $stateParams.view === 'grid' ? 2 : 1;
                //If target Id is not given, redirect to resources area
                if($stateParams.targetId === '') {
                    $state.go('salt.dashboard.resources.masters');
                    return;
                }

                //Get all minions for the current target
                $scope.getTargetMinions();
                $scope.listFilters();
                $scope.getGrainsData();
            break;

            case 'salt.dashboard.resources.job-history':
                if(typeof $state.params.targetId !== 'undefined' && $state.params.targetId !== '') {
                    $scope.getTargetJobHistory();
                } else {
                    growl.info('Target id not specified.');
                }
            break;

            case 'salt.dashboard.resources.minions-job-history':
            	$scope.mode = $stateParams.view === 'grid' ? 2 : 1;
                $scope.getMinionsJobHistory();
            break;
        }

        /**
         * Key Accept and Delete functionality
         */
        $scope.keyAction = '';
        $scope.sendKeyAction = function() {
            var keyAction = $scope.keyAction,
                actionData = { minions: $scope.selectedMinions, action: keyAction };

            SaltMinionService.doKeyAction(actionData)
            /*jshint unused:false*/
            .then(function(response) {
                switch(keyAction) {
                    case 'accept':
                        growl.success('Key accepted successfully');
                    break;

                    case 'delete':
                        growl.success('Key deleted successfully');
                    break;

                    case 'reject':
                        growl.success('Key rejected');
                    break;

                    case 'deny':
                        growl.success('Key denied');
                    break;

                    case 'unaccept':
                        growl.success('Key unaccepted');
                    break;
                }
            }, function(response) {
                switch(response.status) {
                    case 0:
                    case 500:
                        growl.error('Internal Server Error');
                    break;

                    case 404:
                        growl.error('Invalid URL');
                    break;

                    case 401:
                        growl.error('Unauthorized access');
                    break;

                    case 400:
                        if(response.data.error[0] === 'minion_doesnot_exists') {
                            growl.error('No minion available');
                        } else if(response.data.error[0] === 'key_accept_failed') {
                            growl.error('Cannot accept key');
                        } else if(response.data.error[0] === 'key_delete_failed') {
                            growl.error('Cannot delete key');
                        } else if(response.data.error[0] === 'key_reject_failed') {
                            growl.error('Cannot reject key');
                        } else if(response.data.error[0] === 'key_deny_failed') {
                            growl.error('Cannot deny key');
                        } else if(response.data.error[0] === 'key_unaccept_failed') {
                            growl.error('Cannot unaccept key');
                        }
                    break;
                }
            });
        };
        
        
    }]);

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

'use strict';

/**
 * @ngdoc service
 * @name sseFeApp.SaltUrlService
 * @description # SaltUrlService Factory in the sseFeApp. 
 */
angular.module('sseFeApp')
    .factory('SaltUrlService', function() {
        /* The root url. Stays blank when not using Grunt */
        var _apiUrl = '',

            /* Urls identified by the object types. */
            _urls   = {
                minion  : {
                    all                 : _apiUrl + '/minion/all/',
                    one                 : _apiUrl + '/minion/',
                    oneJob              : _apiUrl + '/job/history/',
                    addToQt             : _apiUrl + '/target/qt/add/',
                    getQt               : _apiUrl + '/target/qt/all/',
                    refresh             : _apiUrl + '/job/execute/',
                    addToT              : _apiUrl + '/target/add/',
                    addSelectedToT      : _apiUrl + '/target/minions/add/',
                    deleteQt            : _apiUrl + '/target/qt/delete/',
                    targetMinions       : _apiUrl + '/target/',
                    removeFromQt        : _apiUrl + '/target/qt/',
                    deleteTarget        : _apiUrl + '/target/',
                    deleteFromQt        : _apiUrl + '/target/qt/minions/delete/',
                    editTarget          : _apiUrl + '/target/',
                    targetListAll       : _apiUrl + '/target/list/all/',
                    targetListAllMod    : _apiUrl + '/target/list/all/modify/',
                    saveTextFilter      : _apiUrl + '/minion/filter/save/',
                    listFilters         : _apiUrl + '/minion/filter/list/',
                    applyFilters        : _apiUrl + '/minion/search/',
                    applyGrainFilters   : _apiUrl + '/minion/searchbygrains/',
                    targetJobHistory    : _apiUrl + '/job/target/history/',
                    minionsJobHistory   : _apiUrl + '/job/minions/history/',
                    keyAction           : _apiUrl + '/core/key/action/',
                    reportsAll          : _apiUrl + '/report/minion/all/'
                },
                user    : {
                    authenticate        : _apiUrl + '/core/login/',
                    all                 : _apiUrl + '/core/users/all/',
                    one                 : _apiUrl + '/core/users/',
                    add                 : _apiUrl + '/core/users/add/',
                    edit                : _apiUrl + '/core/users/',
                    remove              : _apiUrl + '/core/users/delete/',
                    count               : _apiUrl + '/core/count/',
                    publicFolderAll     : _apiUrl + '/core/public/folder/all/',
                    privateFolderAll    : _apiUrl + '/core/private/folder/all/',
                    addFolder           : _apiUrl + '/core/folder/create/',
                    deleteFolder        : _apiUrl + '/core/folder/delete/',
                    editTargetFolder    : _apiUrl + '/core/folder/edit/',
                    grainsData          : _apiUrl + '/core/grains/all/'
                },
                master  : {
                    all                 : _apiUrl + '/master/all/',
                    one                 : _apiUrl + '/master/',
                    add                 : _apiUrl + '/master/add/',
                    edit                : _apiUrl + '/master/',
                    remove              : _apiUrl + '/master/delete/'
                },
                job     : {
                    all                 : _apiUrl + '/job/list/',
                    publicFolderAll     : _apiUrl + '/job/public/state/all/',
                    privateFolderAll    : _apiUrl + '/job/private/state/all/',
                    slsUpload           : _apiUrl + '/job/upload/sls/',
                    addFolder           : _apiUrl + '/job/folder/create/',
                    deleteFolder        : _apiUrl + '/job/folder/delete/',
                    editjobFolder       : _apiUrl + '/job/folder/edit/',
                    scheduleJob         : _apiUrl + '/job/execute/',
                    jobSls              : _apiUrl + '/job/download/',
                    jobSlsHistory       : _apiUrl + '/job/sls/history/'
                },
                beacons	: {
                    all                : _apiUrl + '/core/beacons/all/',
                    upload             : _apiUrl + '/core/upload/beacon/script/',
                    targetBeacons      : _apiUrl + '/target/',
                    beaconStats        : _apiUrl + '/core/beacons/stats/',
                    targetBeaconsEvent : _apiUrl + '/core/target/beacons/events/',
                }
            };

        /**
         * Public methods
         */
        return {
            /**
             * Return the urls for a particular object
             * @param {string} which The object name
             * @return {object} The urls object
             */
            getUrls: function(which) {
                return _urls[which];
            }
        };
    });
'use strict';

/**
 * @ngdoc directive
 * @name sseFeApp.directive:treeModel
 * @description
 * # treeModel
 */

angular.module('sseFeApp')
  .directive( 'treeModel', ['$compile', function( $compile ) {
        return {
            restrict: 'A',
            link: function ( scope, element, attrs ) {
                //tree id
                var treeId = attrs.treeId;

                //tree model
                var treeModel = attrs.treeModel;

                //node id
                var nodeId = attrs.nodeId || 'id';

                //node label
                var nodeLabel = attrs.nodeLabel || 'label';

                //children
                var nodeChildren = attrs.nodeChildren || 'children';

                //Isroot
                var isRoot = attrs.nodeRoot;

                var temptarget = [];
                
                var tempnode = [];

                var template = '';


                //tree template
                switch(treeId) {
                case 'publicTargetTree':
                    template =
                        '<ul>' +
                        //Target node
                        '<li ng-repeat="target in node.target">' +
                        '<i></i>' +
                        '<span ng-mouseover="hover=true" ng-mouseout="hover=false" ng-init="hover=false"><a data-trigger="hover" animation="none" placement="bottom" container="body" data-title="{{target.target_name}}" bs-tooltip  data-ng-click="selectedTarget(target)" ui-sref="salt.dashboard.resources.targets({ targetId: target.id })"></a>' +
                        '<span class="child-node-tree hover" ng-show = "hover" ui-sref-active="selected" ui-sref="salt.dashboard.resources.targets({ targetId: target.id })">{{ target.target_name }}</span>' + 
                        '<span class="child-node-tree" ng-hide = "hover" ui-sref="salt.dashboard.resources.targets({ targetId: target.id })" ng-class="{ selected: state.includes(\'salt.dashboard.resources.job-history\', { targetId: target.id }) || state.includes(\'salt.dashboard.resources.target-reports\', { targetId: target.id })  || state.includes(\'salt.dashboard.resources.targets\', { targetId: target.id }) }">{{ target.target_name }}</span>' +
                        '<span ng-class="{'+'hover:hover'+'}" container="body" data-content="content" data-template="views/dialogs/crudHtmlTarget.html" data-auto-close="1" bs-popover class="hover-open del-icon"><span class="glyphicon glyphicon-collapse-down"></span></span></span>' +
                        '</li>' +

                        //Folder node
                        '<li data-ng-repeat="node in ' + treeModel + '">' +
                            '<span ng-mouseover="hover=true" ng-mouseout="hover=false" ng-init="hover=false"><a data-trigger="hover" animation="none" placement="bottom" container="body" data-title="{{node.' + nodeLabel + '}}" bs-tooltip href="" data-ng-click="' + treeId + '.selectNodeLabel(node)"></a>' +
                            '<i ng-class="{'+'hover:hover'+'}" class="ssIcons-icon_open2" data-ng-show="(node.collapsed && (node.' + isRoot + ') !== undefined)" data-ng-click="' + treeId + '.selectNodeHead(node)"></i>' +
                            '<i ng-class="{'+'hover:hover'+'}" class="ssIcons-icon_open3" data-ng-show="(node.collapsed && (node.' + isRoot + ') === undefined)" data-ng-click="' + treeId + '.selectNodeHead(node)"></i>' +
                            '<i ng-class="{'+'hover:hover'+'}" class="ssIcons-icon_close2"  data-ng-show="(!node.collapsed && (node.' + isRoot + ') !== undefined)" data-ng-click="' + treeId + '.selectNodeHead(node)"></i>' +
                            '<i ng-class="{'+'hover:hover'+'}" class="ssIcons-icon_close3"  data-ng-show="(!node.collapsed && (node.' + isRoot + ') === undefined)" data-ng-click="' + treeId + '.selectNodeHead(node)"></i>' +

                            //'<i class="glyphicon glyphicon-file"  data-ng-show="node.target.length" ng-repeat="targeti in node.target">{{ targeti.id }}</i> ' +
                            '<span ng-class="{'+'hover:hover'+'}" data-ng-click="' + treeId + '.selectNodeLabel(node)">{{node.' + nodeLabel + '}}</span>' +
                            '<span ng-class="{'+'hover:hover'+'}" data-ng-show="{{node.' + isRoot + '}}" container="body" data-content="content" data-template="views/dialogs/publicPrivateCrudHtml.html" data-auto-close="1" bs-popover class="del-icon-folder hover-open" data-ng-click="' + treeId + '.selectPopupOpen(node)"><span class="glyphicon glyphicon-collapse-down"></span></span>' +
                            '<span ng-class="{'+'hover:hover'+'}" data-ng-hide="{{node.' + isRoot + '}}" container="body" data-content="content" data-template="views/dialogs/crudHtml.html" data-auto-close="1" bs-popover class="del-icon-folder hover-open" data-ng-click="' + treeId + '.selectPopupOpen(node)"><span class="glyphicon glyphicon-collapse-down"></span></span>' +
                            '</span>' +
                            '<div ng-class="{'+'hover:hover'+'}" data-ng-hide="node.collapsed" data-tree-id="' + treeId + '" data-tree-model="node.' + nodeChildren + '" data-node-id=' + nodeId + ' data-node-label=' + nodeLabel + ' data-node-children=' + nodeChildren + '></div>' +
                            '</li>' +
                        '</ul>';
                     break;
                case 'privateTargetTree':
                    template =
                        '<ul>' +
                        //Target node
                        '<li ng-repeat="target in node.target">' +
                        '<i></i>' +
                        '<span ng-mouseover="hover=true" ng-mouseout="hover=false" ng-init="hover=false"><a data-trigger="hover" animation="none" placement="bottom" container="body" data-title="{{target.target_name}}" bs-tooltip  data-ng-click="selectedTarget(target)" ui-sref="salt.dashboard.resources.targets({ targetId: target.id })"></a>' +
                        '<span class="child-node-tree hover" ng-show = "hover" ui-sref-active="selected" ui-sref="salt.dashboard.resources.targets({ targetId: target.id })">{{ target.target_name }}</span>' + 
                        '<span class="child-node-tree" ng-hide = "hover" ui-sref="salt.dashboard.resources.targets({ targetId: target.id })" ng-class="{ selected: state.includes(\'salt.dashboard.resources.job-history\', { targetId: target.id }) || state.includes(\'salt.dashboard.resources.target-reports\', { targetId: target.id })  || state.includes(\'salt.dashboard.resources.targets\', { targetId: target.id }) }">{{ target.target_name }}</span>' +
                        '<span ng-class="{'+'hover:hover'+'}" container="body" data-content="content" data-template="views/dialogs/crudHtmlTarget.html" data-auto-close="1" bs-popover class="hover-open del-icon"><span class="glyphicon glyphicon-collapse-down"></span></span></span>' +                        
                        '</li>' +

                        //Folder node
                        '<li data-ng-repeat="node in ' + treeModel + '">' +
                            '<span ng-mouseover="hover=true" ng-mouseout="hover=false" ng-init="hover=false"><a data-trigger="hover" animation="none" placement="bottom" container="body" data-title="{{node.' + nodeLabel + '}}" bs-tooltip href="" data-ng-click="' + treeId + '.selectNodeLabel(node)"></a>' +
                            '<i ng-class="{'+'hover:hover'+'}"class="ssIcons-icon_open2" data-ng-show="(node.collapsed && (node.' + isRoot + ') !== undefined)" data-ng-click="' + treeId + '.selectNodeHead(node)"></i>' +
                            '<i ng-class="{'+'hover:hover'+'}" class="ssIcons-icon_open3" data-ng-show="(node.collapsed && (node.' + isRoot + ') === undefined)" data-ng-click="' + treeId + '.selectNodeHead(node)"></i>' +
                            '<i ng-class="{'+'hover:hover'+'}" class="ssIcons-icon_close2"  data-ng-show="(!node.collapsed && (node.' + isRoot + ') !== undefined)" data-ng-click="' + treeId + '.selectNodeHead(node)"></i>' +
                            '<i ng-class="{'+'hover:hover'+'}" class="ssIcons-icon_close3"  data-ng-show="(!node.collapsed && (node.' + isRoot + ') === undefined)" data-ng-click="' + treeId + '.selectNodeHead(node)"></i>' +


                            //'<i class="glyphicon glyphicon-file"  data-ng-show="node.target.length" ng-repeat="targeti in node.target">{{ targeti.id }}</i> ' +
                            '<span ng-class="{'+'hover:hover'+'}" data-ng-click="' + treeId + '.selectNodeLabel(node)">{{node.' + nodeLabel + '}}</span>' +
                            '<span ng-class="{'+'hover:hover'+'}" data-ng-show="{{node.' + isRoot + '}}" container="body" data-content="content" data-template="views/dialogs/publicPrivateCrudHtml.html" data-auto-close="1" bs-popover class="hover-open del-icon-folder" data-ng-click="' + treeId + '.selectPopupOpen(node)"><span class="glyphicon glyphicon-collapse-down"></span></span>' +
                            '<span ng-class="{'+'hover:hover'+'}" data-ng-hide="{{node.' + isRoot + '}}" container="body" data-content="content" data-template="views/dialogs/crudHtml.html" data-auto-close="1" bs-popover class="del-icon hover-open" data-ng-click="' + treeId + '.selectPopupOpen(node)"><span class="glyphicon glyphicon-collapse-down"></span></span>' +
                            '</span>' +
                            '<div ng-class="{'+'hover:hover'+'}" data-ng-hide="node.collapsed" data-tree-id="' + treeId + '" data-tree-model="node.' + nodeChildren + '" data-node-id=' + nodeId + ' data-node-label=' + nodeLabel + ' data-node-children=' + nodeChildren + '></div>' +
                            '</li>' +
                        '</ul>';
                    break;
                    
                case 'privateFolders':
                    template =
                        '<ul>' +
                        '<li data-ng-repeat="node in ' + treeModel + '">' +
                        '<span class="label-txt" title={{node.' + nodeLabel + '}} data-ng-click="' + treeId + '.selectFolderLabel(node)">{{node.' + nodeLabel + '}}</span>' +                       
                        '<div data-tree-id="' + treeId + '" data-tree-model="node.' + nodeChildren + '" data-node-id=' + nodeId + ' data-node-label=' + nodeLabel + ' data-node-children=' + nodeChildren + '></div>' +
                        '</li>' +
                        '</ul>';

                    break;
                case 'publicFolders':
                    template =
                        '<ul>' +
                        '<li data-ng-repeat="node in ' + treeModel + '">' +
                        '<span class="label-txt" title={{node.' + nodeLabel + '}} data-ng-click="' + treeId + '.selectFolderLabel(node)">{{node.' + nodeLabel + '}}</span>' +                       
                        '<div data-tree-id="' + treeId + '" data-tree-model="node.' + nodeChildren + '" data-node-id=' + nodeId + ' data-node-label=' + nodeLabel + ' data-node-children=' + nodeChildren + '></div>' +
                        '</li>' +
                        '</ul>';

                    break;
                case 'publicJobTree':
                    template =
                        '<ul>' +
                        //Target node
                        '<li ng-repeat="job in node.job">' +
                        '<i></i>' +
                        '<span ng-mouseover="hover=true" ng-mouseout="hover=false" ng-init="hover=false"><a data-trigger="hover" animation="none" placement="bottom" container="body" data-title="{{job.name}}" bs-tooltip ui-sref="salt.dashboard.jobs.detail({ jobId: job.id })"></a>' +
                        '<span class="child-node-tree hover" ng-show = "hover" ui-sref-active="selected" ui-sref="salt.dashboard.jobs.detail({ jobId: job.id })">{{ job.name }}</span>' + 
                        '<span class="child-node-tree" ng-hide = "hover" ui-sref-active="selected" ui-sref="salt.dashboard.jobs.detail({ jobId: job.id })">{{ job.name }}</span>' + 
                        '<span ng-class="{'+'hover:hover'+'}" container="body" data-content="content" data-template="views/dialogs/crudHtmlJob.html" data-auto-close="1" bs-popover class="hover-open del-icon"><span class="glyphicon glyphicon-collapse-down"></span></span></span>' +
                        '</li>' +

                        //Folder node
                        '<li data-ng-repeat="node in ' + treeModel + '">' +
                            '<span ng-mouseover="hover=true" ng-mouseout="hover=false" ng-init="hover=false"><a data-trigger="hover" animation="none" placement="bottom" container="body" data-title="{{node.' + nodeLabel + '}} ({{node.sls_count}})" bs-tooltip href="" data-ng-click="' + treeId + '.selectNodeLabel(node)" ui-sref-active="selected" ui-sref="salt.dashboard.jobs.folder({ folderId: node.id })"></a>' +
                            '<i ng-class="{'+'hover:hover'+'}" class="ssIcons-icon_open2" data-ng-show="(node.collapsed && (node.' + isRoot + ') !== undefined)" data-ng-click="' + treeId + '.selectNodeHead(node)"></i>' +
                            '<i ng-class="{'+'hover:hover'+'}" class="ssIcons-icon_open3" data-ng-show="(node.collapsed && (node.' + isRoot + ') === undefined)" data-ng-click="' + treeId + '.selectNodeHead(node)"></i>' +
                            '<i ng-class="{'+'hover:hover'+'}" class="ssIcons-icon_close2"  data-ng-show="(!node.collapsed && (node.' + isRoot + ') !== undefined)" data-ng-click="' + treeId + '.selectNodeHead(node)"></i>' +
                            '<i ng-class="{'+'hover:hover'+'}" class="ssIcons-icon_close3"  data-ng-show="(!node.collapsed && (node.' + isRoot + ') === undefined)" data-ng-click="' + treeId + '.selectNodeHead(node)"></i>' +


                            //'<i class="glyphicon glyphicon-file"  data-ng-show="node.target.length" ng-repeat="targeti in node.target">{{ targeti.id }}</i> ' +
                            '<span ng-class="{'+'hover:hover'+'}" data-ng-click="' + treeId + '.selectNodeLabel(node)">{{node.' + nodeLabel + '}} ({{node.sls_count}})</span>' +
                            '<span ng-class="{'+'hover:hover'+'}"data-ng-show="{{node.' + isRoot + '}}" container="body" data-content="content" data-template="views/dialogs/publicPrivateCrudHtml2.html" data-auto-close="1" bs-popover class="del-icon-folder hover-open" data-ng-click="' + treeId + '.selectPopupOpen(node)"><span class="glyphicon glyphicon-collapse-down"></span></span>' +
                            '<span ng-class="{'+'hover:hover'+'}" data-ng-hide="{{node.' + isRoot + '}}" container="body" data-content="content" data-template="views/dialogs/crudHtml2.html" data-auto-close="1" bs-popover class="del-icon-folder hover-open" data-ng-click="' + treeId + '.selectPopupOpen(node)"><span class="glyphicon glyphicon-collapse-down"></span></span>' +
                            '</span>' +
                            '<div ng-class="{'+'hover:hover'+'}" data-ng-hide="node.collapsed" data-tree-id="' + treeId + '" data-tree-model="node.' + nodeChildren + '" data-node-id=' + nodeId + ' data-node-label=' + nodeLabel + ' data-node-children=' + nodeChildren + '></div>' +
                            '</li>' +
                        '</ul>'; 
                     break;
                case 'privateJobTree':
                    template =
                        '<ul>' +
                        //Target node
                        '<li ng-repeat="job in node.job">' +                        
                        '<i></i>' +
                        '<span ng-mouseover="hover=true" ng-mouseout="hover=false" ng-init="hover=false"><a data-trigger="hover" animation="none" placement="bottom" container="body" data-title="{{job.name}}" bs-tooltip ui-sref="salt.dashboard.jobs.detail({ jobId: job.id })"></a>' +
                        '<span class="child-node-tree hover" ng-show = "hover" ui-sref-active="selected" ui-sref="salt.dashboard.jobs.detail({ jobId: job.id })">{{ job.name }}</span>' + 
                        '<span class="child-node-tree" ng-hide = "hover" ui-sref-active="selected" ui-sref="salt.dashboard.jobs.detail({ jobId: job.id })">{{ job.name }}</span>' + 
                        '<span ng-class="{'+'hover:hover'+'}" container="body" data-content="content" data-template="views/dialogs/crudHtmlJob.html" data-auto-close="1" bs-popover class="hover-open del-icon"><span class="glyphicon glyphicon-collapse-down"></span></span></span>' +                        
                        '</li>' +

                        //Folder node
                        '<li data-ng-repeat="node in ' + treeModel + '">' +
                            '<span ng-mouseover="hover=true" ng-mouseout="hover=false" ng-init="hover=false"><a data-trigger="hover" animation="none" placement="bottom" container="body" data-title="{{node.' + nodeLabel + '}} ({{node.sls_count}})" bs-tooltip href="" data-ng-click="' + treeId + '.selectNodeLabel(node)" ui-sref-active="selected" ui-sref="salt.dashboard.jobs.folder({ folderId: node.id })"></a>' +
                            '<i ng-class="{'+'hover:hover'+'}" class="ssIcons-icon_open2" data-ng-show="(node.collapsed && (node.' + isRoot + ') !== undefined)" data-ng-click="' + treeId + '.selectNodeHead(node)"></i>' +
                            '<i ng-class="{'+'hover:hover'+'}" class="ssIcons-icon_open3" data-ng-show="(node.collapsed && (node.' + isRoot + ') === undefined)" data-ng-click="' + treeId + '.selectNodeHead(node)"></i>' +
                            '<i ng-class="{'+'hover:hover'+'}" class="ssIcons-icon_close2"  data-ng-show="(!node.collapsed && (node.' + isRoot + ') !== undefined)" data-ng-click="' + treeId + '.selectNodeHead(node)"></i>' +
                            '<i ng-class="{'+'hover:hover'+'}" class="ssIcons-icon_close3"  data-ng-show="(!node.collapsed && (node.' + isRoot + ') === undefined)" data-ng-click="' + treeId + '.selectNodeHead(node)"></i>' +


                            //'<i class="glyphicon glyphicon-file"  data-ng-show="node.target.length" ng-repeat="targeti in node.target">{{ targeti.id }}</i> ' +
                            '<span ng-class="{'+'hover:hover'+'}" data-ng-click="' + treeId + '.selectNodeLabel(node)">{{node.' + nodeLabel + '}} ({{node.sls_count}})</span>' +
                            '<span ng-class="{'+'hover:hover'+'}" data-ng-show="{{node.' + isRoot + '}}" container="body" data-content="content" data-template="views/dialogs/publicPrivateCrudHtml2.html" data-auto-close="1" bs-popover class="hover-open del-icon-folder" data-ng-click="' + treeId + '.selectPopupOpen(node)"><span class="glyphicon glyphicon-collapse-down"></span></span>' +
                            '<span ng-class="{'+'hover:hover'+'}" data-ng-hide="{{node.' + isRoot + '}}" container="body" data-content="content" data-template="views/dialogs/crudHtml2.html" data-auto-close="1" bs-popover class="del-icon-folder hover-open" data-ng-click="' + treeId + '.selectPopupOpen(node)"><span class="glyphicon glyphicon-collapse-down"></span></span>' +
                            '</span>' +
                            '<div ng-class="{'+'hover:hover'+'}" data-ng-hide="node.collapsed" data-tree-id="' + treeId + '" data-tree-model="node.' + nodeChildren + '" data-node-id=' + nodeId + ' data-node-label=' + nodeLabel + ' data-node-children=' + nodeChildren + '></div>' +
                            '</li>' +
                        '</ul>';
                    break;
                case 'privateJobFolders':
                    template =
                        '<ul>' +
                        '<li data-ng-repeat="node in ' + treeModel + '">' +
                        '<span class="label-txt" title={{node.' + nodeLabel + '}} data-ng-click="' + treeId + '.selectFolderLabel(node)">{{node.' + nodeLabel + '}}</span>' +                       
                        '<div data-tree-id="' + treeId + '" data-tree-model="node.' + nodeChildren + '" data-node-id=' + nodeId + ' data-node-label=' + nodeLabel + ' data-node-children=' + nodeChildren + '></div>' +
                        '</li>' +
                        '</ul>';

                    break;
                case 'publicJobFolders':
                    template =
                        '<ul>' +
                        '<li data-ng-repeat="node in ' + treeModel + '">' +
                        '<span class="label-txt" title={{node.' + nodeLabel + '}} data-ng-click="' + treeId + '.selectFolderLabel(node)">{{node.' + nodeLabel + '}}</span>' +                       
                        '<div data-tree-id="' + treeId + '" data-tree-model="node.' + nodeChildren + '" data-node-id=' + nodeId + ' data-node-label=' + nodeLabel + ' data-node-children=' + nodeChildren + '></div>' +
                        '</li>' +
                        '</ul>';

                    break;
                    
                case 'publicJobTreeActionBtn':
                    template =
                        '<ul>' +
                        //Target node
                        '<li ng-repeat="job in node.job">' +                        
                        '<span class="job-tree-span" data-ng-click="selectedJob(job)">' +
                        '<span>{{ job.name }}</span>' +
                        '</span>' +
                        '</li>' +

                        //Folder node
                        '<li data-ng-repeat="node in ' + treeModel + '">' +
                            '<span class="job-tree-span-folder" data-ng-click="' + treeId + '.selectNodeHead(node);$event.stopPropagation()"><a href="" data-ng-click="' + treeId + '.selectNodeLabel(node);$event.stopPropagation()"></a>' +
                            '<i class="glyphicon glyphicon-chevron-right" data-ng-show="node.collapsed" data-ng-click="' + treeId + '.selectNodeHead(node);$event.stopPropagation()"></i>' +
                            '<i class="glyphicon glyphicon-chevron-down"  data-ng-show="!node.collapsed" data-ng-click="' + treeId + '.selectNodeHead(node);$event.stopPropagation()"></i>' +
                            '<span data-ng-click="' + treeId + '.selectNodeLabel(node);$event.stopPropagation()">{{node.' + nodeLabel + '}}</span>' +
                            '</span>' +
                            '<div data-ng-hide="node.collapsed" data-tree-id="' + treeId + '" data-tree-model="node.' + nodeChildren + '" data-node-id=' + nodeId + ' data-node-label=' + nodeLabel + ' data-node-children=' + nodeChildren + '></div>' +
                            '</li>' +
                        '</ul>';
                     break;
                case 'privateJobTreeActionBtn':
                    template =
                        '<ul>' +
                        //Target node
                        '<li ng-repeat="job in node.job">' +                        
                        '<span class="job-tree-span" data-ng-click="selectedJob(job)">' +
                        '<span>{{ job.name }}</span>' +
                        '</span>' +
                        '</li>' +

                        //Folder node
                        '<li data-ng-repeat="node in ' + treeModel + '">' +
                            '<span class="job-tree-span-folder" data-ng-click="' + treeId + '.selectNodeHead(node);$event.stopPropagation()"><a href="" data-ng-click="' + treeId + '.selectNodeLabel(node);$event.stopPropagation()"></a>' +
                            '<i class="glyphicon glyphicon-chevron-right" data-ng-show="node.collapsed" data-ng-click="' + treeId + '.selectNodeHead(node);$event.stopPropagation()"></i>' +
                            '<i class="glyphicon glyphicon-chevron-down"  data-ng-show="!node.collapsed" data-ng-click="' + treeId + '.selectNodeHead(node);$event.stopPropagation()"></i>' +
                            '<span data-ng-click="' + treeId + '.selectNodeLabel(node);$event.stopPropagation()">{{node.' + nodeLabel + '}}</span>' +
                            '</span>' +
                            '<div data-ng-hide="node.collapsed" data-tree-id="' + treeId + '" data-tree-model="node.' + nodeChildren + '" data-node-id=' + nodeId + ' data-node-label=' + nodeLabel + ' data-node-children=' + nodeChildren + '></div>' +
                            '</li>' +
                        '</ul>';
                     break;
                
                }
                //check tree id, tree model
                if( treeId && treeModel ) {

                    //root node
                    if( attrs.angularTreeview ) {

                        //create tree object if not exists
                        scope[treeId] = scope[treeId] || {};

                        scope[treeId].selectPopupOpen = scope[treeId].selectPopupOpen || function( selectedNode ){

                            scope.currentTargetFolder = selectedNode;

                            //Collapse or Expand
                            //selectedNode.collapsed = !selectedNode.collapsed;
                        };

                        //if node head clicks,
                        scope[treeId].selectNodeHead = scope[treeId].selectNodeHead || function( selectedNode ){

                            //Collapse or Expand
                            selectedNode.collapsed = !selectedNode.collapsed;
                        };

                        //if node label clicks,
                        scope[treeId].selectNodeLabel = scope[treeId].selectNodeLabel || function( selectedNode ){
                            selectedNode.collapsed = !selectedNode.collapsed;
                            //Get Jobs for this folder
                            if(!selectedNode.collapsed) {
                                //$state.go('salt.dashboard.jobs.folder', { folderId: selectedNode.id });
                                
                            }
                            
                            //remove highlight from previous node
                            if( scope[treeId].currentNode && scope[treeId].currentNode.selected ) {
                                scope[treeId].currentNode.selected = undefined;
                            }

                            //set highlight to selected node
                            selectedNode.selected = 'selected';
                            tempnode = selectedNode;
                            
                            if(temptarget.selected) {
                                temptarget.selected = undefined;
                            }

                            //set currentNode
                            scope[treeId].currentNode = selectedNode;
                        };

                        scope[treeId].selectFolderLabel = scope[treeId].selectFolderLabel || function( selectedNode ){
                            /*jshint camelcase: false */
                            if(scope.target !== undefined) {
                                scope.target.parent_id = selectedNode.id;
                                scope.target.foldername = selectedNode.name;
                            } else {
                            scope.job.parent_id = selectedNode.id;
                            scope.job.foldername = selectedNode.name;
                            
                            }
                        };

                        scope.selectedTarget = function(target) {
                            if(temptarget.selected) {
                                temptarget.selected = undefined;
                            }
                            target.selected = 'selected';
                            temptarget = target;
                            if(tempnode.selected) {
                                tempnode.selected = undefined;
                            }
                        };

                        scope.selectedJob = function(job) {
                            scope.openJobSchedular(job);
                        };
                    }

                    //Rendering template.
                    element.html('').append( $compile( template )( scope ) );
                }
            }
        };
    }]);


'use strict';

/**
 * @ngdoc
 * @name sseFeApp.WebSockService
 * @description All the web socket related methods go here.
 * # WebSockService
 * Web Socket service
 */
angular.module('sseFeApp')
    .factory('WebSockService', function () {
            /*jshint camelcase: false */
            return {
                /**
                 * Websocket Connection
                 */
                connect: function(ws_url) {        
                    return  new WebSocket(ws_url);
                }
            };
    });

'use strict';

/**
 * @ngdoc directive
 * @name sseFeApp.directive:saltFormFocus
 * @description # saltFormFocus
 */
angular.module('sseFeApp').directive('saltFormFocus', ['$timeout', function($timeout) {
    return {
        restrict : 'A',
        scope: {
            focus: '@'
        },
        link : function postLink(scope, element) {
            function doFocus() {
                $timeout(function() {
                  element[0].focus();
                }, 500);
            }

            if (scope.focus !== null) {
                // focus unless attribute evaluates to 'false'
                if (scope.focus !== 'false') {
                    doFocus();
                }

                // focus if attribute value changes to 'true'
                scope.$watch('focus', function(value) {
                    if (value === 'true') {
                        doFocus();
                    }
                });
            } else {
                // if attribute value is not provided - always focus
                doFocus();
            }
        }
    };
}]);

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

      /**
       * Upload SLS file
       */
      $scope.openUploadSLSDialog = function() {
          //Open Upload SLS dialog.
          $scope.job.name = '';
          $scope.job.foldername = $scope.jobPrivateFolderStructure[0].name;
          $scope.job.parent_id = $scope.jobPrivateFolderStructure[0].id;
          $scope.job.is_fav = true;
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

               var file = fileService.getFile();
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


'use strict';

/**
 * @ngdoc function
 * @name sseFeApp.controller:JobsCtrl
 * @description
 * # JobsCtrl
 * Controller of the sseFeApp
 */
angular.module('sseFeApp')
  .controller('ReportsCtrl', ['$scope', '$state', '$stateParams', 'SaltMinionService', 'growl', function($scope, $state, $stateParams, SaltMinionService, growl) {
      $scope.stateParams = $stateParams;
      $scope.chartVisible = false;

      /***
	   * Donut chart for Minion-All Status
	   */
	  $scope.minionStatusChart = {};
	  $scope.minionVerionChart = {};
	  $scope.minionOsTypeChart = {};
	  $scope.minionKeyChart	   = {};

	  /*jshint -W030 */
	  $scope.totalMinionsAll;
	  $scope.onlineMinionsAll;
	  $scope.offlineMinionsAll;
	  $scope.expiredMinionsAll;

	  //Specify the chart type
	  $scope.minionKeyChart.type =  $scope.minionOsTypeChart.type = $scope.minionVerionChart.type = $scope.minionStatusChart.type = 'PieChart';

	  //Specify the chart global options
	  $scope.minionKeyChart.options = $scope.minionOsTypeChart.options = $scope.minionVerionChart.options = $scope.minionStatusChart.options = {
          chartArea         : { left: 0, top: 10, width: '100%', height: '90%' },
          pieHole           : 0.5,
          backgroundColor   : 'none', 
          width				: 550,
          height			: 250,
          legend            : { position:  'right' },
          fontName          : 'Lato-Black',
          slices: {
              0: { color: '#19BE9C' },
              1: { color: '#B74022' },
              2: { color: '#C6D3CA' }
          }
	  };

	  /**
	   * Get reports
	   * @param {number} targetId Target ID for reports
	   */
	  $scope.getReports = function(targetId) {
	      //Send target id for url params
		  $scope.chartVisible = false;
		  var targetParams;
		  if(targetId === true){
			  targetParams = { qtid: 'True' };
		  } else{
			  targetParams = { tid: targetId };
		  }
	      
	      SaltMinionService.getReports(targetParams)
	      .then(function(response) {
	          /*jshint camelcase: false */
	          $scope.totalMinionsAll 		 = response.data.data.total_minions;
	          $scope.minionVersionStats 	 = response.data.data.minion_version_stats;
	          $scope.minionOsType	 		 = response.data.data.minion_os_stats;
	          $scope.minionKeyStats			 = response.data.data.minion_key_stats;
	          

	          /** For Version Chart **/
	          $scope.minionVersionAll = [];	          

	          for (var i=0; i<$scope.minionVersionStats.length; i++) {
	        	  $scope.tempArray = [];
	        	  $scope.tempArray.push({v:$scope.minionVersionStats[i].version});
	        	  $scope.tempArray.push({v:$scope.minionVersionStats[i].count});
	        	  $scope.minionVersionAll.push({c:$scope.tempArray});
	          }	          

	          /** For OS Chart **/
	          $scope.minionOsAll = [];	          
	          for (var j=0; j<$scope.minionOsType.length; j++) {
	        	  $scope.tempArrayOs = [];
	        	  $scope.tempArrayOs.push({v:$scope.minionOsType[j].name});
	        	  $scope.tempArrayOs.push({v:$scope.minionOsType[j].count});
	        	  $scope.minionOsAll.push({c:$scope.tempArrayOs});  
	          }

	          /*jshint camelcase: false */
	          $scope.onlineMinionsAll    = [{v:'Online'}, {v: response.data.data.minion_conn_stats.online_minions}];
	          $scope.offlineMinionsAll   = [{v:'Offline'}, {v: response.data.data.minion_conn_stats.offline_minions}];
	          $scope.expiredMinionsAll   = [{v:'Expired'}, {v: response.data.data.minion_conn_stats.expired_minions}];

	          //Set data attributes for all Charts
	          $scope.minionStatusChart.data = {
	                  'cols': [
	                     {id: 't', label: 'Minions', type: 'string'},
	                     {id: 's', label: 'Count', type: 'number'}
	                 ],
	                 'rows': [
	                      {c: $scope.onlineMinionsAll},
	                      {c: $scope.expiredMinionsAll},
	                      {c: $scope.offlineMinionsAll}
	                  ]
		          };

	          $scope.minionVerionChart.data = {
	                  'cols': [
	                     {id: 't', label: 'Minions', type: 'string'},
	                     {id: 's', label: 'Count', type: 'number'}
	                 ],
	                 'rows': $scope.minionVersionAll
		          };
	          
	          $scope.minionOsTypeChart.data = {
	                  'cols': [
	                     {id: 't', label: 'Minions', type: 'string'},
	                     {id: 's', label: 'Count', type: 'number'}
	                 ],
	                 'rows': $scope.minionOsAll
		          };

	          $scope.acceptedKeys  = [{v:'Accepted'}, {v: response.data.data.minion_key_stats.accepted_keys}];
	          $scope.deletedKeys   = [{v:'Deleted'}, {v: response.data.data.minion_key_stats.deleted_keys}];
	          $scope.pendingKeys   = [{v:'Pending'}, {v: response.data.data.minion_key_stats.pending_keys}];

	          $scope.minionKeyChart.data = {
	                  'cols': [
	                     {id: 't', label: 'Minions', type: 'string'},
	                     {id: 's', label: 'Count', type: 'number'}
	                 ],
	                 'rows': [
	                      {c: $scope.acceptedKeys},
	                      {c: $scope.deletedKeys},
	                      {c: $scope.pendingKeys}
	                  ]
		          };
	          $scope.chartVisible 		     = true;
	      }, function(response) {
	          switch(response.status) {
	              case 0:
	              case 500:
	                  growl.error('Unknown server error');
                  break;

	              case 401:
	                  growl.error('Unauthorized access');
                  break;

	              case 404:
	                  growl.error('Invalid URL');
                  break;

	              case 400:
	                  if(response.data.error[0] === 'target_doesnot_exists') {
	                      growl.error('Target does not exist');
                      } else {
	                      growl.error('Unknown error');
	                  }
	                  //Redirect to minion reports page
	                  $state.go('salt.dashboard.reports.minions');
                  break;
	          }
	      });
	  };

	  //State based function call
	  if($state.current.name === 'salt.dashboard.resources.target-reports') {
	      $scope.getReports(parseInt($state.params.targetId, 10));
	  } else if($state.current.name === 'salt.dashboard.resources.quicktargtes-reports'){
		  $scope.getReports(true);
	  	} else {
	  		$scope.getReports();
	  		}
  }]);
'use strict';

/**
 * @ngdoc function
 * @name sseFeApp.controller:BeaconsCtrl
 * @description
 * # BeaconsCtrl
 * Controller of the sseFeApp
 */
angular.module('sseFeApp')
    .controller('BeaconsCtrl', [ '$scope', 'SaltBeaconService', 'growl', '$modal', 'fileService', '$state', 'lodash', function($scope, SaltBeaconService, growl, $modal, fileService, $state, lodash) {

        $scope.uploadBeaconModal = {};
        $scope.noFile = true;
        $scope.beacons = [];
        $scope.beaconsDesc = 'This is description text.';
        
        $scope.beaconsChartGlobalOptions = {
            'type'      : 'AreaChart',
            'displayed' : true,
            'data'      : {
                'cols'  : [
                     {
                         'id'   : 'hours',
                         'label': 'Hours',
                         'type' : 'string',
                         'p'    : {}
                    },
                    {
                        'id'    : 'login-id',
                        'label' : 'Login',
                        'type'  : 'number',
                        'p'     : {}
                    }
                ]
            },
            'options'   : {
                'title'             : 'Login Per Hour Across System',
                'titleTextStyle'    : {'color': '#84DBF3'},
                'isStacked'         : 'false',
                'fill'              : 20,
                'colors'            : ['#84DBF3'],
                'backgroundColor'   :'#455569',
                'displayExactValues': true,
                'vAxis'             : {
                    'title'         : 'No. of Login',
                    'titleTextStyle':{'color': '#fff'},
                    'textStyle'     :{'color': '#778A9D'},
                    'gridlines'     : {
                        'count': 10
                    },
                    'ticks'         : [0, 5, 10, 15, 20, 25]
                },
                'hAxis' : {
                    'title'         : 'Hours',
                    'titleTextStyle': {'color': '#fff'},
                    'textStyle'     : {'color': '#778A9D'},
                },
                'legend': {
                    'textStyle': {'color':'#fff'},
                },
                'tooltip': {
                    'isHtml': false
                },
            },                  
            'formatters': {},
            'view': {}
        };


        /**
         * To list down the beacons in UI
         * 
         */
        $scope.selectedBeacon = {};
        $scope.beaconsList = {};

        $scope.getBeaconsAll = function() {
            SaltBeaconService.getBeaconsAll()
            .then(function(response) {
                $scope.beaconsList = response.data.data.results;
                $scope.selectedBeacon = $scope.beaconsList[0];
            }, function(response) {
              switch(response.status) {
                  case 0:
                  case 500:
                      growl.error('Unknown server error');
                  break;
    
                  case 401:
                      growl.error('Unauthorized access');
                  break;
    
                  case 404:
                      growl.error('Invalid URL');
                  break;
    
                  case 400:
                      growl.error('Unknown server error');
                  break;
              }
            });
        };
        $scope.getBeaconsAll();

        /*
         * For Selected beacons.
         */
        $scope.setSelectedBeacon = function(beacon) {
            $scope.selectedBeacon = beacon;
        };

        /**
         * Modal for upload beacon
         */
        $scope.uploadBeaconForm = function() {
            $scope.uploadBeaconModal = $modal.open({
                templateUrl : 'views/dialogs/uploadBeacons.html',
                scope       : $scope,
                backdrop    : 'static'
            });

            //Accept
            $scope.uploadBeaconConfirm = function(beacon) {
                //Blank name not allowed
                if(!beacon || !beacon.name) {
                    return;
                }

                var file = fileService.getFile(),
                    fileNameParts = file.name.split('.');

                //Check extension
                if(fileNameParts[fileNameParts.length - 1] !== 'py') {
                    growl.error('Invalid file type.');
                    $scope.noFile = false;
                    return;
                }

                $scope.beacon = beacon;

                //Handle upload
                //TODO Use modal promise
                SaltBeaconService.uploadBeaconFile(beacon, file)
                .then(function() {
                    growl.success('Beacon uploaded successfully');
                    $scope.uploadBeaconModal.dismiss();
                }, function(response) {
                    switch(response.status) {
                        case 0:
                        case 500:
                            growl.error('Unknown server error');
                        break;

                        case 401:
                            growl.error('Unauthorized access');
                        break;

                        case 404:
                            growl.error('Invalid URL');
                        break;

                        case 400:
                            if(response.data.error[0] === 'name_empty') {
                                growl.error('Name of the beacon is empty');
                            } else if(response.data.error[0] === 'description_empty') {
                                growl.error('Description of the beacon is empty');
                            } else if(response.data.error[0] === 'error_uploading_file') {
                                growl.error('Unable to write file to the server');
                            } else if(response.data.error[0] === 'invalid_script') {
                                growl.error('Invalid beacon script uploaded');
                            } else if(response.data.error[0] === 'script_file_empty') {
                                growl.error('Empty script uploaded');
                            } else {
                                growl.error('Unknown server error');
                            }
                        break;
                    }
                });
            };

            //Reject
            $scope.uploadBeaconCancel = function() {
                $scope.uploadBeaconModal.dismiss();
            };
        };

        /**
         * Get beacons for a target
         */
        $scope.getTargetBeacons = function() {
            $scope.beaconsMessage = 'Loading beacons...';
            SaltBeaconService.getTargetBeacons($state.params.targetId)
            .then(function(response) {
                if(response.data.data.count > 0) {
                    $scope.beacons = response.data.data.results;
                } else {
                    $scope.beaconsMessage = '0 beacons for this target.';
                }
            }, function(response) {
                $scope.beaconsMessage = 'Cannot load beacons';
                switch(response.status) {
                    case 0:
                    case 500:
                        growl.error('Unknown server error');
                    break;

                    case 401:
                        growl.error('Unauthorized access');
                    break;

                    case 404:
                        growl.error('Invalid URL');
                    break;

                    case 400:
                       growl.error('Unknown server error');
                    break;
                }
            });
        };

        /**
         * Get target beacon stats
         */
        $scope.getBeaconStats = function(forTarget) {
            //URL params
            /* jshint camelcase: false*/
            var params = { type: 'wtmp' };
            
            if(forTarget) {
                params.target_id = $state.params.targetId;
            }
            
            SaltBeaconService.getTargetBeaconStats(params)
            .then(function(response) {
                if(response.data.data) {
                    var rows = [];
                    angular.forEach(response.data.data, function(val, key) {
                        rows.push({ c: [{ v: key}, { v: val, f: val + ' people logged in' }, null ] });
                    });

                    $scope.beconsLoginsPerHourChart = $scope.beaconsChartGlobalOptions;
                    $scope.beconsLoginsPerHourChart.data.rows = rows;
                }
            }, function(response) {
                switch(response.status) {
                    case 0:
                    case 500:
                        growl.error('Unknown server error');
                    break;

                    case 401:
                        growl.error('Unauthorized access');
                    break;

                    case 404:
                        growl.error('Invalid URL');
                    break;

                    case 400:
                        if(response.data.error[0] === 'difference_must_be_integer') {
                            growl.error('Interval must be an integer');
                        } else if(response.data.error[0] === 'hours_must_be_integer') {
                            growl.error('Hours must be an integer');
                        } else if(response.data.error[0] === 'target_id_must_be_integer') {
                            growl.error('Target Id must be an integer');
                        } else {
                            growl.error('Unknown server error');
                        }
                    break;
                }
            });
        };
        
        /*
         * Get Target All Beacons Events
         */
        $scope.getAllBeaconsEvent = function() {
          //URL params
            /* jshint camelcase: false*/
            var params = { target_id: $state.params.targetId };
            
            SaltBeaconService.getTargetBeaconEvents(params)
            .then(function(response) {
                $scope.targetBeaconsEvent = response.data.data;
                $scope.beaconKeys = lodash.keys($scope.targetBeaconsEvent);
            }, function(response) {
                switch(response.status) {
                    case 0:
                    case 500:
                        growl.error('Unknown server error');
                    break;

                    case 401:
                        growl.error('Unauthorized access');
                    break;

                    case 404:
                        growl.error('Invalid URL');
                    break;

                    case 400:
                            growl.error('Internal server error');

                    break;
                }
            });
            
        };
        
        
        $scope.checkBoxStatusBeacons = function() {
            $scope.selectedBeacons = [];
            for(var i=0; i<$scope.beaconsList.length;i++) {
                if($scope.beaconsList[i].isChecked) {
                    var beaconId = parseInt($scope.beaconsList[i].id, 10);
                    $scope.selectedBeacons.push(beaconId);
                    }
            }
        };
        
        /**
         * Remove Beacons
         */
        $scope.confirmDeleteBeacons = function() {
            //Create
            $scope.deleteBeaconsModal = $modal.open({
                templateUrl : 'views/dialogs/confirmDeleteBeacons.html',
                scope       : $scope,
                backdrop    : 'static'
            });

            //Accept
            $scope.confirmDeleteOk = function() {
                $scope.deleteBeaconsModal.close();
            };

            //Reject
            $scope.confirmDeleteCancel = function() {
                $scope.deleteBeaconsModal.dismiss();
            };

            //Handle promise
            $scope.deleteBeaconsModal.result.then(function() {
                $scope.removeBeacons();
            }, function() {
                //Nothing
            });
            
        };
        
        $scope.removeBeacons = function() {
            console.log($scope.selectedBeacons);
            /*SaltMinionService.deleteQuickTarget()
            .then(function() {
                $state.go($state.current, {}, {reload: true});
            }); */
            
        };


        //State based function calls
        if($state.current.name === 'salt.dashboard.resources.target-beacons') {
            $scope.getTargetBeacons();
            $scope.getBeaconStats(true);
            $scope.getAllBeaconsEvent();
        } else {
            $scope.getBeaconStats();
        }
    }]);

'use strict';

/**
 * @ngdoc service
 * @name sseFeApp.SaltBeaconService
 * @description
 * # SaltBeaconService
 * Factory in the sseFeApp.
 */
angular.module('sseFeApp')
    .factory('SaltBeaconService', ['$http', '$q', 'SaltUrlService', 'SaltConfig', function($http, $q, SaltUrlService, SaltConfig) {
        /* Get all the urls for beacons */
        var _urls = SaltUrlService.getUrls('beacons');

        /**
         * Public methods
         */
        return {
            /**
             * Get all Beacons available in system.
             * @return {object} $http Promise for the Ajax call
             */
            getBeaconsAll: function() {
                var config = {
                        method: 'get',
                        url: _urls.all,
                        headers: {
                            AUTHORIZATION: 'Token ' + SaltConfig.getUser().token
                        }
                    };

                return $http(config);
            },

            /**
             * Upload the beacon file
             * @param {object} beaconData The data for the beacon
             * @param {object} beaconFile The beacon file
             * @return {object} $http Promise for the Ajax call
             */
            uploadBeaconFile: function(beaconData, beaconFile) {
                /* jshint unused: false */
                var config = {
                        method: 'post',
                        url: _urls.upload,
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            AUTHORIZATION : 'Token ' + SaltConfig.getUser().token,
                        },
                        data: {
                            name: beaconData.name,
                            description: beaconData.description,
                            script: beaconFile
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

            /**
             * Get the beacons for a target
             * @param {number} targetId The target Id
             * @return {object} $http Promise for the Ajax call
             */
            getTargetBeacons: function(targetId) {
                var config = {
                        method: 'get',
                        url: _urls.targetBeacons + targetId + '/beacons/',
                        headers: {
                            AUTHORIZATION: 'Token ' + SaltConfig.getUser().token
                        }
                    };

                return $http(config);
            },

            /**
             * Get stats for a target's beacons
             * @param {object} params URL parameters for the API
             * @return {object} $http Promise for the Ajax call
             */
            getTargetBeaconStats: function(params) {
                var config = {
                        method: 'get',
                        url: _urls.beaconStats,
                        params: params,
                        headers: {
                            AUTHORIZATION: 'Token ' + SaltConfig.getUser().token
                        }
                    };

                return $http(config);
            },
            
            /**
             * Get stats for a target's beacons
             * @param {object} params URL parameters for the API
             * @return {object} $http Promise for the Ajax call
             */
            getTargetBeaconEvents: function(params) {
                var config = {
                        method: 'get',
                        url: _urls.targetBeaconsEvent,
                        params: params,
                        headers: {
                            AUTHORIZATION: 'Token ' + SaltConfig.getUser().token
                        }
                    };

                return $http(config);
            }
        };
    }]);