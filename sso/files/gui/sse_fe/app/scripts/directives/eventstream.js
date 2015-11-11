/**
*  Module
*
* Description
*/
angular.module('sseFeApp')
.directive('ssEventStream', function () {
    'use strict';

    return {
        scope: {},
        controller: function($scope, $http, SaltUrlService, SaltConfig) {
            function getEventFeed() {
                $http.get(SaltUrlService.getUrls('job').eventStream, {
                    headers: { AUTHORIZATION : 'Token ' + SaltConfig.getUser().token },
                }).then(function (resp) {
                    // Make the data for each event pretty JSON
                    resp.data.forEach(function (saltEnv) {
                        var obj = JSON.parse(saltEnv.data);
                        saltEnv.data = JSON.stringify(obj, null, 2);
                    });
                    $scope.events = resp.data;
                });
            }

            getEventFeed(); // initialize the feed
            // long poll the feed every 5 seconds
            setInterval(getEventFeed, 5000);
        },
        restrict: 'EA',
        templateUrl: 'views/directives/eventstream.html',
        replace: true,
    };
});
