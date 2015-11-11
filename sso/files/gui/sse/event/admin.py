from django.contrib import admin
from event.models import Event


class EventAdmin(admin.ModelAdmin):

    '''
        ModelAdmin for class Event
    '''
    fields = ['data', 'tag']

admin.site.register(Event, EventAdmin)
