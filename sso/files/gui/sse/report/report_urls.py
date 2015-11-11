"""
    URLs for repot app
"""

from django.conf.urls import patterns, url
from report.views import (AllMinionReport)

urlpatterns = patterns('',
                       url(r'^minion/all/$', AllMinionReport.as_view(),),)
