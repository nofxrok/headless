"""
    Database Model definitions for minion app
"""
import datetime

from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django_pgjsonb import JSONField

from master.models import Master
from core.models import Beacon, Pillar
import json


class Minion(models.Model):

    """
        Minion table will be automatically be updated by a scheduled background job.
    """

    hostname = models.CharField(
        max_length=255, help_text="The salt minion hostname/ip address")
    master = models.ForeignKey(
        Master, help_text="The master to which this minion belongs.")
    minion_id = models.CharField(max_length=255)
    config = JSONField(default={})
    pillar_config = JSONField(default={})
    is_minion_up = models.BooleanField(default=True)
    last_seen = models.DateTimeField(blank=True, null=True)

    def __unicode__(self):
        return self.hostname

    def __str__(self):
        return self.hostname

    class Meta:
        ordering = ['hostname']
        verbose_name_plural = "Minion"

    ACCEPTED = 0
    PENDING = 1
    REJECTED = 2
    DELETED = 3

    KEY_STATUS_CHOICES = (
        (PENDING, 'pending'),
        (ACCEPTED, 'accepted'),
        (REJECTED, 'rejected'),
        (DELETED, 'deleted')
    )

    key_status = models.IntegerField(choices=KEY_STATUS_CHOICES, default=PENDING)



class TargetCollections(models.Model):

    """
        Table defining a collection of minions having a hierarchy
        Reference for related name: https://docs.djangoproject.com/en/dev/ref/models/fields/#
        django.db.models.ForeignKey.related_name
    """

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, related_name="+")

    modified_at = models.DateTimeField()
    modified_by = models.ForeignKey(User, related_name="+")

    parent_collection_id = models.ForeignKey("self", help_text='The parent collection. \
    Collections are hierarchical in nature.')

    def __unicode__(self):
        return self.name

    class Meta:
        ordering = ['name']
        verbose_name_plural = "Target Collection"


class MinionCollection(models.Model):

    """
        Table to Map minions to collections.
    """

    collection = models.ForeignKey(TargetCollections)
    minion = models.ForeignKey(Minion)

    def __unicode__(self):
        return self.minion

    class Meta:
        ordering = ['minion']
        verbose_name_plural = "Minion Collection"


class MinionBeacon(models.Model):
    """
        Table to maintain a map what beacons are applied to what minions
    """

    minion = models.ForeignKey(Minion)
    beacon = models.ForeignKey(Beacon)

    created_at = models.DateTimeField(blank=True, null=True, auto_now=True)
    created_by = models.ForeignKey(User, related_name="+", null=True)

    modified_at = models.DateTimeField(blank=True, null=True, auto_now_add=True)
    modified_by = models.ForeignKey(User, related_name="+", null=True)

    def __unicode__(self):
        return self.minion

    def __str__(self):
        return self.beacon.name

    class Meta:
        ordering = ['minion']
        verbose_name_plural = "Minion Beacons"
