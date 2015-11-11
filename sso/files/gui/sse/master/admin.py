from django.contrib import admin
from master.models import (Master, MasterToken,)


class MasterAdmin(admin.ModelAdmin):

    '''
        ModelAdmin for class Master
    '''
    fields = ['hostname', 'netapi_port', 'auth_mode',
              'created_by', 'modified_by', 'config']
    list_display = ['hostname', 'netapi_port', 'auth_mode']


class MasterTokenAdmin(admin.ModelAdmin):

    '''
        ModelAdmin for class MasterToken
    '''
    fields = ['master', 'user', 'token', 'allowed_functions',
              'has_expired', 'created_at',]


admin.site.register(Master, MasterAdmin)
admin.site.register(MasterToken, MasterTokenAdmin)
