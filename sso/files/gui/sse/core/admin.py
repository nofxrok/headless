#!/usr/bin/python3
# -*- coding: utf-8 -*-

"""
    Admin module for core app
"""

from core.models import (GlobalConfig, UserProfile, SystemFolder, MinionFilter,
                         Grains, GrainsValue, Beacon)
from django.contrib import admin


class GlobalConfigAdmin(admin.ModelAdmin):

    """
        ModelAdmin for class GlobalConfig
    """
    fields = ["name", "value"]
    list_display = ["name", "value"]

admin.site.register(GlobalConfig, GlobalConfigAdmin)

class UserProfileAdmin(admin.ModelAdmin):

    """
        ModelAdmin for class UserProfile
    """
    list_display = ["user", "is_admin", "is_superuser", "is_user"]

admin.site.register(UserProfile, UserProfileAdmin)

class SystemFolderAdmin(admin.ModelAdmin):

    """
        ModelAdmin for class SystemFolder
    """
    list_display = ["name", "parent", "created_by"]

admin.site.register(SystemFolder, SystemFolderAdmin)


class MinionFilterAdmin(admin.ModelAdmin):

    """
        ModelAdmin for class MinionFilter
    """
    list_display = ["user", "filter_name", "search_type", "search_field",
                    "match_parameters", "search_text", "created_at"]

admin.site.register(MinionFilter, MinionFilterAdmin)


class GrainsAdmin(admin.ModelAdmin):
    """
        ModelAdmin for Grains Model
    """
    list_display = ["name"]

admin.site.register(Grains, GrainsAdmin)


class GrainsValueAdmin(admin.ModelAdmin):
    """
        ModelAdmin for GrainsValue Model
    """
    list_display = ["grain", "value"]

admin.site.register(GrainsValue, GrainsValueAdmin)


class BeaconAdmin(admin.ModelAdmin):
    """
        ModelAdmin for Beacon Model
    """
    list_display = ["name", "description"]

admin.site.register(Beacon, BeaconAdmin)
