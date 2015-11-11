"""
    URLs for core app
"""

from django.conf.urls import patterns, url
from .views import (MinionList, MinionObject, MinionSaveFilter,
                    MinionFilterList, FilterMinions, FilterMinionsByGrains)

urlpatterns = patterns('',
                       url(r'^all/$', MinionList.as_view(),),
                       url(r'^(?P<id>\d+)/$', MinionObject.as_view()),
                       url(r'^filter/save/$', MinionSaveFilter.as_view()),
                       url(r'^filter/list/$', MinionFilterList.as_view()),
                       url(r'^search/$', FilterMinions.as_view()),
                       url(r'^searchbygrains/$', FilterMinionsByGrains.as_view()),
                       )
