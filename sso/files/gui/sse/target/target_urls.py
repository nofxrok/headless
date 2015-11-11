"""
    URL Conf for Target App
"""


from .views import (CreateQuickTargetView, ListQuickTargetView, DeleteQuickTargetMinionView,
                    DeleteQuickTargetView, CreateTarget, ListTargetView,
                    ListTargetMinionsView, DeleteTargetView, ListTargetBeaconsView,
                    DeleteQuickTargetMinionsView, DeleteTargetMinionsView, CreateSelectedMinionTarget,
                    EditTargetView, ListAllTargets, ModifySelectedTargets)

from django.conf.urls import patterns, url

urlpatterns = patterns('',
                       url(r'^qt/add/$', CreateQuickTargetView.as_view(),),
                       url(r'^qt/all/$', ListQuickTargetView.as_view(),),
                       url(r'^qt/delete/$', DeleteQuickTargetView.as_view(),),
                       url(r'^qt/(?P<minion_id>[0-9]+)/delete/$',
                           DeleteQuickTargetMinionView.as_view(),),
                       url(r'^qt/minions/delete/$',
                           DeleteQuickTargetMinionsView.as_view(),),
                       url(r'^add/$', CreateTarget.as_view(),),
                       url(r'^minions/add/$', CreateSelectedMinionTarget.as_view(),),
                       url(r'^all/$', ListTargetView.as_view(),),
                       url(r'^(?P<target_id>\d+)/beacons/$', ListTargetBeaconsView.as_view(),),
                       url(r'^(?P<target_id>\d+)/minions/$', ListTargetMinionsView.as_view(),),
                       url(r'^(?P<target_id>\d+)/delete/$', DeleteTargetView.as_view(),),
                       url(r'^(?P<target_id>\d+)/minions/delete/$', DeleteTargetMinionsView.as_view(),),
                       url(r'^(?P<target_id>\d+)/edit/$', EditTargetView.as_view(),),
                       url(r'^list/all/$', ListAllTargets.as_view(),),
                       url(r'^list/all/modify/$', ModifySelectedTargets.as_view(),),
                       )
