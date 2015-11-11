"""
    URLs for job app
"""

from .views import (PublicStateFolderView, PrivateStateFolderView, UploadSLSView,
                    JobListView, JobLeafView, CreateJobFolderView, EditJobFolderView,
                    DeleteJobFolderView, StoreAndExecuteJobView, MinionJobHistory,
                    DownloadSLS, SLSJobHistory, JobHistoryListView,
                    StoreAndExecuteTargetJobView, SaltEventListView, DeleteJobView)

from django.conf.urls import patterns, url

urlpatterns = patterns('',
                       url(r'^download/(?P<uid>\d+)/$', DownloadSLS.as_view(),),
                       url(r'^eventfeed/$', SaltEventListView.get_feed),
                       url(r'^eventfeed/(?P<limit>\d+)$', SaltEventListView.get_feed),
                       url(r'^execute/(?P<uid>\d+)/$', StoreAndExecuteJobView.as_view(),),
                       url(r'^execute/(?P<uid>\d+)/target/(?P<tid>\d+)/$', StoreAndExecuteTargetJobView.as_view(),),
                       url(r'^folder/create/$', CreateJobFolderView.as_view(),),
                       url(r'^folder/delete/(?P<uid>\d+)/$', DeleteJobFolderView.as_view(),),
                       url(r'^folder/edit/$', EditJobFolderView.as_view(),),
                       url(r'^history/(?P<minionid>\d+)/$', MinionJobHistory.as_view(),),
                       url(r'^list/$', JobListView.as_view(),),
                       url(r'^list/(?P<uid>\d+)/$', JobLeafView.as_view(),),
                       url(r'^minions/history/$', JobHistoryListView.as_view(),),
                       url(r'^private/state/all/$', PrivateStateFolderView.as_view(),),
                       url(r'^public/state/all/$', PublicStateFolderView.as_view(),),
                       url(r'^salt_events/$', SaltEventListView.as_view(),),
                       url(r'^sls/history/(?P<sls_id>\d+)/$', SLSJobHistory.as_view(),),
                       url(r'^target/history/(?P<target_id>\d+)/$', JobHistoryListView.as_view(),),
                       url(r'^upload/sls/$', UploadSLSView.as_view(),),
                       url(r'^delete/(?P<uid>\d+)/$', DeleteJobView.as_view(),),
                       )
