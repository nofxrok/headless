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
                        '<span ng-mouseover="hover=true" ng-mouseout="hover=false" ng-init="hover=false"><a data-trigger="hover" animation="none" placement="bottom" container="body" data-title="{{target.target_name}}" bs-tooltip  data-ng-click="selectedTarget(target)" ui-sref="salt.dashboard.resources.targets({ targetId: target.id, view: \'list\'})"></a>' +
                        '<span class="child-node-tree hover" ng-show = "hover" ui-sref-active="selected" ui-sref="salt.dashboard.resources.targets({ targetId: target.id, view: \'list\'})">{{ target.target_name }}</span>' + 
                        '<span class="child-node-tree" ng-hide = "hover" ui-sref="salt.dashboard.resources.targets({ targetId: target.id, view: \'list\'})" ng-class="{ selected: state.includes(\'salt.dashboard.resources.job-history\', { targetId: target.id }) || state.includes(\'salt.dashboard.resources.job-history-minion\', { targetId: target.id }) || state.includes(\'salt.dashboard.resources.target-reports\', { targetId: target.id })  || state.includes(\'salt.dashboard.resources.targets\', { targetId: target.id }) || state.includes(\'salt.dashboard.resources.target-beacons\', { targetId: target.id }) }">{{ target.target_name }}</span>' +
                        '<span ng-class="{'+'hover:hover'+'}" container="body" data-content="content" data-template="views/dialogs/crudHtmlTarget.html" data-auto-close="1" bs-popover class="hover-open del-icon"><span class="glyphicon glyphicon-collapse-down"></span></span></span>' +
                        '</li>' +

                      //Folder node
                        '<li data-ng-repeat="node in ' + treeModel + '">' +
                            '<span ng-mouseover="node.hover=true" ng-mouseout="node.hover=false" ng-init="node.hover=false"><a data-trigger="hover" animation="none" placement="bottom" container="body" data-title="{{node.' + nodeLabel + '}}" bs-tooltip href="" data-ng-click="' + treeId + '.selectNodeLabel(node)" ui-sref-active="selected" ui-sref="salt.dashboard.resources.folder({ folderId: node.id, view: \'list\'})"></a>' +
                            '<i ng-class="{ \'selected\': state.includes(\'salt.dashboard.resources.folder-minions-job-history\', { folderId: node.id }) || state.includes(\'salt.dashboard.resources.folder\', { folderId: node.id }), \'hover\':node.hover }" ui-sref="salt.dashboard.resources.folder({ folderId: node.id, view: \'list\'})" class="ssIcons-icon_open2" data-ng-show="(node.collapsed && (node.' + isRoot + ') !== undefined)" data-ng-click="' + treeId + '.selectNodeHead(node)"></i>' +
                            '<i ng-class="{ \'selected\': state.includes(\'salt.dashboard.resources.folder-minions-job-history\', { folderId: node.id }) || state.includes(\'salt.dashboard.resources.folder\', { folderId: node.id }), \'hover\':node.hover } " ui-sref="salt.dashboard.resources.folder({ folderId: node.id, view: \'list\'})" class="ssIcons-icon_open3" data-ng-show="(node.collapsed && (node.' + isRoot + ') === undefined)" data-ng-click="' + treeId + '.selectNodeHead(node)"></i>' +
                            '<i ng-class="{ \'selected\': state.includes(\'salt.dashboard.resources.folder-minions-job-history\', { folderId: node.id }) || state.includes(\'salt.dashboard.resources.folder\', { folderId: node.id }), \'hover\':node.hover } " ui-sref="salt.dashboard.resources.folder({ folderId: node.id, view: \'list\'})"  class="ssIcons-icon_close2"  data-ng-show="(!node.collapsed && (node.' + isRoot + ') !== undefined)" data-ng-click="' + treeId + '.selectNodeHead(node)"></i>' +
                            '<i ng-class="{ \'selected\': state.includes(\'salt.dashboard.resources.folder-minions-job-history\', { folderId: node.id }) || state.includes(\'salt.dashboard.resources.folder\', { folderId: node.id }), \'hover\':node.hover } " ui-sref="salt.dashboard.resources.folder({ folderId: node.id, view: \'list\'})"  class="ssIcons-icon_close3"  data-ng-show="(!node.collapsed && (node.' + isRoot + ') === undefined)" data-ng-click="' + treeId + '.selectNodeHead(node)"></i>' +


                            //'<i class="glyphicon glyphicon-file"  data-ng-show="node.target.length" ng-repeat="targeti in node.target">{{ targeti.id }}</i> ' +
                            '<span ng-class="{ \'selected\': state.includes(\'salt.dashboard.resources.folder-minions-job-history\', { folderId: node.id }) || state.includes(\'salt.dashboard.resources.folder\', { folderId: node.id }), \'hover\':node.hover } " ui-sref="salt.dashboard.resources.folder({ folderId: node.id, view: \'list\'})"  data-ng-click="' + treeId + '.selectNodeLabel(node)">{{node.' + nodeLabel + '}}</span>' +
                            '<span ng-class="{ \'selected\': state.includes(\'salt.dashboard.resources.folder-minions-job-history\', { folderId: node.id }) || state.includes(\'salt.dashboard.resources.folder\', { folderId: node.id }), \'hover\':node.hover } " ui-sref="salt.dashboard.resources.folder({ folderId: node.id, view: \'list\'})"  data-ng-show="{{node.' + isRoot + '}}" container="body" data-content="content" data-template="views/dialogs/publicPrivateCrudHtml.html" data-auto-close="1" bs-popover class="hover-open del-icon-folder" data-ng-click="' + treeId + '.selectPopupOpen(node)"><span class="glyphicon glyphicon-collapse-down"></span></span>' +
                            '<span ng-class="{\'selected\': state.includes(\'salt.dashboard.resources.folder-minions-job-history\', { folderId: node.id }) || state.includes(\'salt.dashboard.resources.folder\', { folderId: node.id }), \'hover\':node.hover } " ui-sref="salt.dashboard.resources.folder({ folderId: node.id, view: \'list\'})"  data-ng-hide="{{node.' + isRoot + '}}" container="body" data-content="content" data-template="views/dialogs/crudHtml.html" data-auto-close="1" bs-popover class="del-icon hover-open" data-ng-click="' + treeId + '.selectPopupOpen(node)"><span class="glyphicon glyphicon-collapse-down"></span></span>' +
                            '</span>' +
                            '<div data-ng-hide="node.collapsed" data-tree-id="' + treeId + '" data-tree-model="node.' + nodeChildren + '" data-node-id=' + nodeId + ' data-node-label=' + nodeLabel + ' data-node-children=' + nodeChildren + '></div>' +
                            '</li>' +
                        '</ul>';
                     break;
                case 'privateTargetTree':
                    template =
                        '<ul>' +
                        //Target node
                        '<li ng-repeat="target in node.target">' +
                        '<i></i>' +
                        '<span ng-mouseover="hover=true" ng-mouseout="hover=false" ng-init="hover=false"><a data-trigger="hover" animation="none" placement="bottom" container="body" data-title="{{target.target_name}}" bs-tooltip  data-ng-click="selectedTarget(target)" ui-sref="salt.dashboard.resources.targets({ targetId: target.id, view: \'list\'})"></a>' +
                        '<span class="child-node-tree hover" ng-show = "hover" ui-sref-active="selected" ui-sref="salt.dashboard.resources.targets({ targetId: target.id, view: \'list\' })">{{ target.target_name }}</span>' + 
                        '<span class="child-node-tree" ng-hide = "hover" ui-sref="salt.dashboard.resources.targets({ targetId: target.id, view: \'list\' })" ng-class="{ selected: state.includes(\'salt.dashboard.resources.job-history\', { targetId: target.id }) || state.includes(\'salt.dashboard.resources.job-history-minion\', { targetId: target.id }) || state.includes(\'salt.dashboard.resources.target-reports\', { targetId: target.id })  || state.includes(\'salt.dashboard.resources.targets\', { targetId: target.id }) || state.includes(\'salt.dashboard.resources.target-beacons\', { targetId: target.id }) }">{{ target.target_name }}</span>' +
                        '<span ng-class="{'+'hover:hover'+'}" container="body" data-content="content" data-template="views/dialogs/crudHtmlTarget.html" data-auto-close="1" bs-popover class="hover-open del-icon"><span class="glyphicon glyphicon-collapse-down"></span></span></span>' +                        
                        '</li>' +

                        //Folder node
                        '<li data-ng-repeat="node in ' + treeModel + '">' +
                            '<span ng-mouseover="node.hover=true" ng-mouseout="node.hover=false" ng-init="node.hover=false"><a data-trigger="hover" animation="none" placement="bottom" container="body" data-title="{{node.' + nodeLabel + '}}" bs-tooltip href="" data-ng-click="' + treeId + '.selectNodeLabel(node)" ui-sref-active="selected" ui-sref="salt.dashboard.resources.folder({ folderId: node.id, view: \'list\'})"></a>' +
                            '<i ng-class="{ \'selected\': state.includes(\'salt.dashboard.resources.folder-minions-job-history\', { folderId: node.id }) || state.includes(\'salt.dashboard.resources.folder\', { folderId: node.id }), \'hover\':node.hover }" ui-sref="salt.dashboard.resources.folder({ folderId: node.id, view: \'list\'})" class="ssIcons-icon_open2" data-ng-show="(node.collapsed && (node.' + isRoot + ') !== undefined)" data-ng-click="' + treeId + '.selectNodeHead(node)"></i>' +
                            '<i ng-class="{ \'selected\': state.includes(\'salt.dashboard.resources.folder-minions-job-history\', { folderId: node.id }) || state.includes(\'salt.dashboard.resources.folder\', { folderId: node.id }), \'hover\':node.hover } " ui-sref="salt.dashboard.resources.folder({ folderId: node.id, view: \'list\'})" class="ssIcons-icon_open3" data-ng-show="(node.collapsed && (node.' + isRoot + ') === undefined)" data-ng-click="' + treeId + '.selectNodeHead(node)"></i>' +
                            '<i ng-class="{ \'selected\': state.includes(\'salt.dashboard.resources.folder-minions-job-history\', { folderId: node.id }) || state.includes(\'salt.dashboard.resources.folder\', { folderId: node.id }), \'hover\':node.hover } " ui-sref="salt.dashboard.resources.folder({ folderId: node.id, view: \'list\'})"  class="ssIcons-icon_close2"  data-ng-show="(!node.collapsed && (node.' + isRoot + ') !== undefined)" data-ng-click="' + treeId + '.selectNodeHead(node)"></i>' +
                            '<i ng-class="{ \'selected\': state.includes(\'salt.dashboard.resources.folder-minions-job-history\', { folderId: node.id }) || state.includes(\'salt.dashboard.resources.folder\', { folderId: node.id }), \'hover\':node.hover } " ui-sref="salt.dashboard.resources.folder({ folderId: node.id, view: \'list\'})"  class="ssIcons-icon_close3"  data-ng-show="(!node.collapsed && (node.' + isRoot + ') === undefined)" data-ng-click="' + treeId + '.selectNodeHead(node)"></i>' +


                            //'<i class="glyphicon glyphicon-file"  data-ng-show="node.target.length" ng-repeat="targeti in node.target">{{ targeti.id }}</i> ' +
                            '<span ng-class="{ \'selected\': state.includes(\'salt.dashboard.resources.folder-minions-job-history\', { folderId: node.id }) || state.includes(\'salt.dashboard.resources.folder\', { folderId: node.id }), \'hover\':node.hover } " ui-sref="salt.dashboard.resources.folder({ folderId: node.id, view: \'list\'})"  data-ng-click="' + treeId + '.selectNodeLabel(node)">{{node.' + nodeLabel + '}}</span>' +
                            '<span ng-class="{ \'selected\': state.includes(\'salt.dashboard.resources.folder-minions-job-history\', { folderId: node.id }) || state.includes(\'salt.dashboard.resources.folder\', { folderId: node.id }), \'hover\':node.hover } " ui-sref="salt.dashboard.resources.folder({ folderId: node.id, view: \'list\'})"  data-ng-show="{{node.' + isRoot + '}}" container="body" data-content="content" data-template="views/dialogs/publicPrivateCrudHtml.html" data-auto-close="1" bs-popover class="hover-open del-icon-folder" data-ng-click="' + treeId + '.selectPopupOpen(node)"><span class="glyphicon glyphicon-collapse-down"></span></span>' +
                            '<span ng-class="{\'selected\': state.includes(\'salt.dashboard.resources.folder-minions-job-history\', { folderId: node.id }) || state.includes(\'salt.dashboard.resources.folder\', { folderId: node.id }), \'hover\':node.hover } " ui-sref="salt.dashboard.resources.folder({ folderId: node.id, view: \'list\'})"  data-ng-hide="{{node.' + isRoot + '}}" container="body" data-content="content" data-template="views/dialogs/crudHtml.html" data-auto-close="1" bs-popover class="del-icon hover-open" data-ng-click="' + treeId + '.selectPopupOpen(node)"><span class="glyphicon glyphicon-collapse-down"></span></span>' +
                            '</span>' +
                            '<div data-ng-hide="node.collapsed" data-tree-id="' + treeId + '" data-tree-model="node.' + nodeChildren + '" data-node-id=' + nodeId + ' data-node-label=' + nodeLabel + ' data-node-children=' + nodeChildren + '></div>' +
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
                        '<ul class="publicJobTreeActionUL">' +
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
                        '<ul class="publicJobTreeActionUL">' +
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

