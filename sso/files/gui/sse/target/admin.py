"""
    Model Admin config for Target App
"""
from django.contrib import admin
from target.models import Target, UserFavorites, TargetMinions


class TargetAdmin(admin.ModelAdmin):

    """
        ModelAdmin for Target
    """
    list_display = ['target_name', 'created_at', 'created_by' ,'system_folder']


class TargetMinionsAdmin(admin.ModelAdmin):

    """
        ModelAdmin for TargetMinions
    """
    list_display = ['target', 'minion']


class UserFavoritesAdmin(admin.ModelAdmin):

    """
        ModelAdmin for User Favorites
    """
    list_display = ['user', 'target']

admin.site.register(Target, TargetAdmin)
admin.site.register(UserFavorites, UserFavoritesAdmin)
admin.site.register(TargetMinions, TargetMinionsAdmin)
