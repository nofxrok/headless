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
                         'googlechart',
                         'angularMoment',
                         'pasvaz.bindonce'
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

             .state('salt.dashboard.resources.quicktargets-reports', {
                url: '/quicktarget/dashboard',
                templateUrl: 'views/reports.html',
                controller: 'ReportsCtrl'
            })

            .state('salt.dashboard.resources.target-reports', {
                url: '/targets/:targetId/dashboard',
                templateUrl: 'views/target.reports.html',
                controller: 'ReportsCtrl'
            })

            .state('salt.dashboard.resources.target-eventstream', {
                url: '/targets/:targetId/eventstream',
                templateUrl: 'views/targets/target.eventstream.html',
            })

            //All minions
            .state('salt.dashboard.resources.minions', {
                url: '/minions/:view',
                templateUrl: 'views/minions.html',
                controller: 'MinionsCtrl',
                data: {pageTitle : 'Minions - All' , viewBtns : true}
            })
            
            // All minions for Folders
           .state('salt.dashboard.resources.folder', {
                url: '/:folderId/minions/:view',
                templateUrl: 'views/minions.html',
                controller: 'MinionsCtrl',
                data: {pageTitle : 'Minions - All' , viewBtns : true}
            })
            //Minion detail
            .state('salt.dashboard.resources.minions.detail', {
                url: '/details/:minionId',
                templateUrl: 'views/minions.detail.html',
//                controller: 'MinionsCtrl'
            })
            
           //Minion detail
            .state('salt.dashboard.resources.folder.detail', {
                url: '/details/:minionId',
                templateUrl: 'views/minions.detail.html',
//                controller: 'MinionsCtrl'
            })

            //All minions for a master
            .state('salt.dashboard.resources.minions.master', {
                url: '/master/:masterId',
                templateUrl: 'views/minions.html',
                controller: 'MinionsCtrl',
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
//                controller: 'MinionsCtrl'
            })

            .state('salt.dashboard.resources.targets', {
                url : '/targets/:targetId/:view',
                templateUrl: 'views/targets.html',
                controller: 'MinionsCtrl',
                data: { pageTitle : 'Targets' , viewBtns : true }
            })

            /*.state('salt.dashboard.resources.target-beacons', {
                url : '/targets/:targetId/:view/beacons',
                templateUrl: 'views/target.beacons.html',
                controller: 'BeaconsCtrl',
                data: { pageTitle : 'Beacons' , viewBtns : true }
            })*/

            .state('salt.dashboard.resources.job-history', {
                url: '/job/history/:targetId',
                templateUrl: 'views/target.job.history.html',
                controller: 'MinionsCtrl',
                data: { pageTitle : 'Target Job History' , viewBtns : true }
            })
            
            .state('salt.dashboard.resources.job-history-minion', {
                url: '/job/history/:targetId/minions',
                templateUrl: 'views/minions.job.history.html',
                controller: 'MinionsCtrl',
                data: { pageTitle : 'Minion Job History' , viewBtns : true }
            })

            .state('salt.dashboard.resources.minions-job-history', {
                url: '/job/minions/history/:view',
                templateUrl: 'views/minions.job.history.html',
                controller: 'MinionsCtrl',
                data: { pageTitle : 'Minion Job History' , viewBtns : true }
            })

            .state('salt.dashboard.resources.quicktargets-job-history', {
                url: '/job/quicktarget/history/:view',
                templateUrl: 'views/minions.job.history.html',
                controller: 'MinionsCtrl',
                data: { pageTitle : 'Quicktarget Minion Job History' , viewBtns : true }
            })

            .state('salt.dashboard.resources.folder-minions-job-history', {
                url: '/folder/job/history/:folderId',
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
//                controller: 'MinionsCtrl'
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

        	/*.state('salt.dashboard.settings.beacons', {
        		url: '/beacons',
        		templateUrl: 'views/settings.beacons.html',
        		controller: 'BeaconsCtrl',
        		data: {pageTitle : 'Beacons', viewBtns : false}
        	})*/

        	.state('salt.dashboard.settings.beacons.list', {
	            url: '/list',
	            templateUrl: 'views/settings.beacons.list.html'
	        });
        /*********/
        $urlRouterProvider.otherwise('/dashboard');
    }])

    .run(['$state', '$rootScope', '$location', 'SaltAuthService', function($state, $rootScope, $location, SaltAuthService) {
        //Avoid page access based on logged in status
        $rootScope.$on( '$stateChangeStart', function(e, toState, toParams, fromState) {
            //Get the current users log in status
            var loggedIn = SaltAuthService.isUserLoggedIn();

            //Redirect to login if the user is not logged in and not on the login page already
            if (toState.name !== 'salt.login' && !loggedIn) {
                e.preventDefault();
                $state.go('salt.login');
            }

            //Redirect to current page, if the user is already logged in and tries to access the login page
            //This might reset all the UI changes on the current page since there will be a refresh
            //The refresh cannot be avoided since the following condition will be checked only when the transition happens
            if(toState.name === 'salt.login' && loggedIn) {
                e.preventDefault();
                $state.go(fromState.name);
            }
        });

        //Save current and previous states for reference
        $rootScope.state = $state;
        $rootScope.$on('$stateChangeSuccess', function(ev, to, toParams, from) {
            $rootScope.previousState = from.name;
            $rootScope.currentState = to.name;
        });
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
