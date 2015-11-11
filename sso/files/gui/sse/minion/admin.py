from django.contrib import admin
from minion.models import (TargetCollections, Minion, MinionCollection, MinionBeacon)


class TargetCollectionsAdmin(admin.ModelAdmin):

    '''
        ModelAdmin for class TargetCollections
    '''
    fields = ['name', 'description', 'created_at',
              'created_by', 'modified_at', 'modified_by']

admin.site.register(TargetCollections, TargetCollectionsAdmin)


class MinionAdmin(admin.ModelAdmin):

    '''
        ModelAdmin for class Minion
    '''
    list_display = ['minion_id', 'master']

admin.site.register(Minion, MinionAdmin)


class MinionBeaconAdmin(admin.ModelAdmin):

    '''
        ModelAdmin for class MinionBeacon
    '''
    fields = ["minion", "beacon"]

admin.site.register(MinionBeacon, MinionBeaconAdmin)


class MinionCollectionAdmin(admin.ModelAdmin):

    '''
        ModelAdmin for class MinionCollection
    '''
    fields = ['minion']

admin.site.register(MinionCollection, MinionCollectionAdmin)
