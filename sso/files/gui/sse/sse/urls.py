from django.conf.urls import patterns, include, url
from django.contrib import admin

urlpatterns = patterns('',
                       url(r'^report/', include('report.report_urls')),
                       url(r'^target/', include('target.target_urls')),
                       url(r'^job/', include('job.job_urls')),
                       url(r'^master/', include('master.master_urls')),
                       url(r'^minion/', include('minion.minion_urls')),
                       url(r'^core/', include('core.core_urls')),
                       url(r'^admin/', include(admin.site.urls)),
                       url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
                       )
