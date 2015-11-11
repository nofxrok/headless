'''
    URLs for core app
'''


from . import views
from core.views import (UserListView, UserView, DeleteUsers, EditUserView,
                        UserObject, ObjectCountView, CreateSystemFolderView,
                        DeleteSystemFolderView, EditSystemFolderView,
                        PrivateSystemFolderView, PublicSystemFolderView,
                        GrainsListView, MinionKeyAction, BeaconsListView,
                        ListBeaconActiveTargets, UploadBeaconScript,
                        TargetBeaconsStatsView, TargetBeaconsListView,
                        TargetBeaconsEventListView, DeleteBeacons,
                        FolderMinionListing)

from .models import Grains, Beacon
from django.conf.urls import patterns, url
from django.contrib.auth.models import User

urlpatterns = patterns('', url(r'^login/$',
                               views.AuthenticateUserView.as_view(),
                               name='authenticate'),
                       url(r'^users/all/$',
                           UserListView.as_view(model=User),),
                       url(r'^users/add/$',
                           UserView.as_view()),
                       url(r'^users/delete/$',
                           DeleteUsers.as_view()),
                       url(r'^users/(?P<userid>\d+)/edit/$',
                           EditUserView.as_view()),
                       url(r'^users/(?P<userid>\d+)/$',
                           UserObject.as_view()),
                       url(r'^count/$',
                           ObjectCountView.as_view(),),
                       url(r'^folder/delete/(?P<folder_id>\d+)/$',
                           DeleteSystemFolderView.as_view(),),
                       url(r'^folder/create/$',
                           CreateSystemFolderView.as_view(),),
                       url(r'^folder/edit/$',
                           EditSystemFolderView.as_view(),),
                       url(r'^public/folder/all/$',
                           PublicSystemFolderView.as_view(),),
                       url(r'^private/folder/all/$',
                           PrivateSystemFolderView.as_view(),),
                       url(r'^key/action/$',
                           MinionKeyAction.as_view(),),
                       url(r'^grains/all/$',
                           GrainsListView.as_view(model=Grains),),
                       url(r'^beacons/all/$',
                           BeaconsListView.as_view(model=Beacon),),
                       url(r'^beacons/(?P<beacon_id>\d+)/activetargets/$',
                           ListBeaconActiveTargets.as_view(),),
                       url(r'^upload/beacon/script/$',
                           UploadBeaconScript.as_view(),),
                       url(r'^beacons/stats/$',
                           TargetBeaconsStatsView.as_view(),),
                       url(r'^beacons/list/$',
                           TargetBeaconsListView.as_view(),),
                       url(r'^target/beacons/events/$',
                           TargetBeaconsEventListView.as_view(),),
                       url(r'^beacons/delete/$',
                           DeleteBeacons.as_view(),),
                       url(r'folder/minion/list/(?P<folderid>\d+)/$',
                           FolderMinionListing.as_view(),),)
