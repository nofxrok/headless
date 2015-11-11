"""
    URLs for core app
"""

from . import views
from django.conf.urls import patterns, url
from master.views import MasterList, MasterObject, DeleteMasters, EditMasterView
from master.models import Master

urlpatterns = patterns('',
                       url(r'^all/$', MasterList.as_view(model=Master),),
                       url(r'^add/$', views.MasterView.as_view(),),
                       url('^delete/$', DeleteMasters.as_view()),
                       url('^(?P<hostname>.+)/edit/$',
                           EditMasterView.as_view()),
                       url('^(?P<hostname>.+)/$', MasterObject.as_view()),
                       )
