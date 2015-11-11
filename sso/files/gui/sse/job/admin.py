from django.contrib import admin

from job.models import (jids, salt_returns, Job, UserJobNotification, JobTargetMinion,
                        Module, Function, StateFolder, SLSInformation, salt_events)


class jidsAdmin(admin.ModelAdmin):

    """
        ModelAdmin class for JobID
    """

    list_display = ["jid", "load"]

admin.site.register(jids, jidsAdmin)


class salt_eventsAdmin(admin.ModelAdmin):

    """
        ModelAdmin for class SaltEvents
    """

    list_display = ['data', 'tag', 'alter_time']

admin.site.register(salt_events, salt_eventsAdmin)


class salt_returnsAdmin(admin.ModelAdmin):

    """
        ModelAdmin for class SaltReturns
    """

    list_display = ['pk_id', 'id', "alter_time", "full_ret", "fun", "jid", "success"]

admin.site.register(salt_returns, salt_returnsAdmin)


class JobAdmin(admin.ModelAdmin):

    """
        ModelAdmin for class Job
    """

    list_display = ["sls_info", "execute", "execute_at", "retry_option", "retry_count",
                    "end_after", "run_type", "action_on_error", "priority",
                    "status", "created_at", "created_by"]

admin.site.register(Job, JobAdmin)


class UserJobNotificationAdmin(admin.ModelAdmin):

    """
        ModelAdmin for class UserJobNotification
    """
    fields = ["job", "user"]

admin.site.register(UserJobNotification, UserJobNotificationAdmin)


class JobTargetMinionAdmin(admin.ModelAdmin):

    """
        ModelAdmin for class JobTargetMinionAdmin
    """
    fields = ["job", "minion"]

admin.site.register(JobTargetMinion, JobTargetMinionAdmin)


class ModuleAdmin(admin.ModelAdmin):

    """
        ModelAdmin for class Module
    """
    fields = ["name"]

admin.site.register(Module, ModuleAdmin)


class FunctionAdmin(admin.ModelAdmin):

    """
        ModelAdmin for class Function
    """
    fields = ["module", "name"]
    list_display = ["module", "name"]

admin.site.register(Function, FunctionAdmin)


class StateFolderAdmin(admin.ModelAdmin):
 
    """
        ModelAdmin for class StateFolder
    """
    list_display = ["name", "parent"]

admin.site.register(StateFolder, StateFolderAdmin)


class SLSInformationAdmin(admin.ModelAdmin):
 
    """
        ModelAdmin for class SLSInformation
    """
    list_display = ["name", "location", "state_folder", "created_by", "created_at"]

admin.site.register(SLSInformation, SLSInformationAdmin)

