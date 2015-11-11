#!/usr/bin/python3
# -*- coding: utf-8 -*-

"""
    Models for core app
"""

from django.contrib.auth.models import User
from django.db import models
from django.db.models.signals import post_save

from django_pgjsonb import JSONField
from mptt.models import MPTTModel, TreeForeignKey

class UserProfile(models.Model):

    """
        User profile model
        Contains flags to denote the type of user
        1. normal user (user)
        2. admin user
        3. super user
    """
    user = models.OneToOneField(User)
    is_admin = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    is_user = models.BooleanField(default=False)


def create_user_profile(sender, instance, created, **kwargs):
    """
        post signal creation of profile entry in userprofile
        table
    """
    if created:
        UserProfile.objects.create(user=instance)

post_save.connect(create_user_profile, sender=User)


class GlobalConfig(models.Model):

    """
        global configuration table
    """

    name = models.CharField(max_length=10, help_text="Stores the \
    type of the configuration")
    value = models.TextField(help_text="Stores the actual value of\
     the configuration")

    class Meta:
        verbose_name_plural = "Global Config"


class SystemFolder(MPTTModel):
    """
        Model to maintain the Private, Public Folder structure
    """
    name = models.CharField(max_length=255)
    parent = TreeForeignKey('self', null=True, blank=True,
                            related_name='children')

    created_at = models.DateTimeField(blank=True, null=True, auto_now=True)
    created_by = models.ForeignKey(User, related_name="+", null=True)

    modified_at = models.DateTimeField(blank=True, null=True, auto_now_add=True)
    modified_by = models.ForeignKey(User, related_name="+", null=True)

    def __str__(self):
        return self.name

    class Meta:
        unique_together = (("name", "parent"),)
        ordering = ['name']
        verbose_name_plural = "System Folder"

    class MPTTMeta:
        order_insertion_by = ['name']


class MinionFilter(models.Model):

    """
        Table used to store the filter parameters saved by user for future use
    """

    SEARCH_TYPE = (
        (1, 'Text'),
        (2, 'Grains'),
        (3, 'Both'),
    )

    MATCH_PARAMETERS = ((1, "Contains"),
                        (2, "Does Not Contains"),
                        (3, "Starts With"),
                        (4, "Ends With"),
                        (5, "Is"),)

    SEARCH_FIELD = ((1, "Node"),
                    (2, "Master"),
                    (3, "Target Group"),
                    (4, "IP Address"),)

    user = models.ForeignKey(User,
                             help_text="User which this filter belongs to.")
    filter_name = models.CharField(max_length=30, blank=False, null=False,
                                   help_text="Add a filter name.")
    search_type = models.IntegerField(choices=SEARCH_TYPE, default=1)
    match_parameters = models.IntegerField(choices=MATCH_PARAMETERS, default=1)
    search_field = models.IntegerField(choices=SEARCH_FIELD, default=1)
    search_text = models.CharField(max_length=30, blank=True, null=True)
    search_grains = JSONField(default={}, blank=True)
    created_at = models.DateTimeField(blank=True, null=True)

    def __unicode__(self):
        return self.filter_name

    class Meta:
        ordering = ['filter_name']
        verbose_name_plural = "Minion Filter"


class Grains(models.Model):
    """
        Grains table definition
    """
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']
        verbose_name_plural = "Grains"


class GrainsValue(models.Model):
    """
        Grains value table definition
    """
    value = models.TextField(help_text="List of possible grain values \
    from all available minions")
    grain = models.ForeignKey(Grains)

    class Meta:
        ordering = ['grain']
        verbose_name_plural = "GrainsValue"


class Beacon(models.Model):
    """
        To store the uploaded beacon information and metadata
    """

    name = models.TextField(help_text="Beacon name")
    description = models.TextField(help_text="Description about the beacon")
    file_path = models.TextField(help_text=\
                                 "File path where beacon file is stored")
    created_by = models.ForeignKey(User)
    created_at = models.DateTimeField(blank=True, null=True, auto_now=True)

    def __unicode__(self):
        return self.name

    def __str__(self):
        return self.name

    class Meta:
        ordering = ["-id"]
        verbose_name_plural = "Beacon"


class Pillar(models.Model):
    '''
    Table for pillar Database. Stores the pillar data as message pack. Unpacked
    data is expected to be a dictionary
    '''
    name = models.CharField(max_length=255, primary_key=True)
    data = JSONField()

    created_at = models.DateTimeField(blank=True, null=True, auto_now=True)
    created_by = models.ForeignKey(User, related_name="+", null=True)

    modified_at = models.DateTimeField(blank=True, null=True, auto_now_add=True)
    modified_by = models.ForeignKey(User, related_name="+", null=True)

    def __unicode__(self):
        return self.name

    def __str__(self):
        return self.name
