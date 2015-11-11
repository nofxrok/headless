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
	  $scope.getReports = function(targetParams) {
		  //Send target id for url params
		  $scope.chartVisible = false;

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
	          
	          $scope.statusChart = $scope.minionStatusChart;
	          $scope.verionChart = $scope.minionVerionChart;
	          $scope.osTypeChart = $scope.minionOsTypeChart;
	          $scope.keyChart    = $scope.minionKeyChart;
	          $scope.chartVisible      = true;
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
	      $scope.getReports({ tid: parseInt($state.params.targetId, 10) });
	  } else if($state.current.name === 'salt.dashboard.resources.quicktargets-reports'){
		  $scope.getReports({ qtId: true });
	  } else {
		  $scope.getReports();
	  }
  }]);