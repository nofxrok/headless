"""
    Model Definitions for Target App
"""
from core.models import SystemFolder, Pillar
from django.contrib.auth.models import User
from django.db import models
from minion.models import Minion

class Target(models.Model):

    """
        Target table definition
    """
    GLOB = 'glob'
    REGEX = 'regex'
    LIST = 'list'
    GRAINS = 'grains'
    SUBNET = 'subnet/ip'
    COMPOUND = 'compound'
    NODES = 'nodegroups'

    TYPE_CHOICES = (
        (GLOB, 'Globbing'),
        (REGEX, 'Regular Expressions'),
        (LIST, 'Lists'),
        (GRAINS, 'Grains'),
        (SUBNET, 'Subnet/IP Address'),
        (COMPOUND, 'Compound'),
        (NODES, 'Node groups'),
    )

    target_name = models.CharField(max_length=255)
    salt_target = models.CharField(max_length=255, null=True)
    target_type = models.CharField(max_length=50, choices=TYPE_CHOICES, default=LIST)

    created_at = models.DateTimeField(blank=True, null=True)
    created_by = models.ForeignKey(User, related_name="+", null=True)

    modified_at = models.DateTimeField(blank=True, null=True)
    modified_by = models.ForeignKey(User, related_name="+", null=True)
    is_quick_target = models.BooleanField(default=False)
    system_folder = models.ForeignKey(SystemFolder, blank=True, null=True)
    pillars = models.ManyToManyField(Pillar, related_name='targets')

    def __str__(self):
        return self.target_name

    class Meta:
        unique_together = (("is_quick_target", "created_by", "target_name", "system_folder"),)
        ordering = ['target_name']
        verbose_name_plural = "Target"


class TargetMinions(models.Model):

    """
        TargetMinions table definition
    """
    target = models.ForeignKey(Target)
    minion = models.ForeignKey(Minion)

    class Meta:
        ordering = ['target_id']
        verbose_name_plural = "Target Minions"


class UserFavorites(models.Model):

    """
        User Favorites table definition
    """
    user = models.ForeignKey(User)
    target = models.ForeignKey(Target)

    class Meta:
        ordering = ['user']
        verbose_name_plural = "User Favorites"

