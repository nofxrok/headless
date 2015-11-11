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
                    folderMinions       : _apiUrl + '/core/folder/minion/list/',
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
                    deleteJob           : _apiUrl + '/job/delete/',
                    editjobFolder       : _apiUrl + '/job/folder/edit/',
                    scheduleJob         : _apiUrl + '/job/execute/',
                    jobSls              : _apiUrl + '/job/download/',
                    jobSlsHistory       : _apiUrl + '/job/sls/history/',
                    saltEventList       : _apiUrl + '/job/salt_events/',
                    eventStream         : _apiUrl + '/job/eventfeed/'
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
