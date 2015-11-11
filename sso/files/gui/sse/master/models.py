"""
    Database Model definitions for master app
"""
from django.db import models
from django.contrib.auth.models import User
from django_pgjsonb import JSONField

from core.utils import request


class Master(models.Model):

    """
        Table of masters.
    """

    AUTH_TYPE = (
        ('pam', 'pam'),
        ('ldap', 'ldap'),
    )

    hostname = models.CharField(
        max_length=45, unique=True, help_text="The salt master hostname ip address")
    netapi_port = models.IntegerField()
    auth_mode = models.CharField(max_length=5, choices=AUTH_TYPE)

    created_at = models.DateTimeField(blank=True, null=True, auto_now=True)
    created_by = models.ForeignKey(User, related_name="+", null=True)

    modified_at = models.DateTimeField(
        blank=True, null=True, auto_now_add=True)
    modified_by = models.ForeignKey(User, related_name="+", null=True)
    config = JSONField(default={})

    def __unicode__(self):
        return self.hostname

    def __str__(self):
        return self.hostname

    def save(self, *args, **kwargs):
        """
            Override the save method with custom logic
        """
        super(Master, self).save(*args, **kwargs)

    class Meta:
        ordering = ['hostname']
        verbose_name_plural = "Master"

    def api_request(self, method, path, body=None, extra_headers=None):
        '''
        Make a request to salt api for the given master
        '''
        headers = {'Content-Type': 'application/json',}

        if extra_headers:
            headers.update(extra_headers)

        return request(self.hostname,
                       self.netapi_port,
                       method,
                       path,
                       body,
                       headers)

    def api_post(self, body, extra_headers=None):
        '''
        Make a post request to salt api for the given master
        '''
        return self.api_request('POST', '/', body, extra_headers)


    def sync_all_grains(self):
        '''
        Make an api call to saltutil.sync_grains
        '''
        data = {
            'fun': 'saltutil.sync_grains',
            'client': 'local_async',
            'tgt': '*',
            'expr_form': 'glob'
        }

        master_token = self.mastertoken_set.filter(~models.Q(user__username="saltadmin"))[0]

        return self.api_post(data, {'X-Auth-Token': master_token.token})


class MasterToken(models.Model):

    """
        User token for each individual master.
    """

    master = models.ForeignKey("Master")
    user = models.ForeignKey(User)
    token = models.CharField(max_length=255)
    allowed_functions = models.TextField(help_text="JSON serialized text with information about what\
    can be done with this token.")
    has_expired = models.BooleanField(default=False)
    created_at = models.DateTimeField(
        auto_now_add=False, blank=True, null=True)

    def __unicode__(self):
        return self.master

    class Meta:
        ordering = ['master']
        verbose_name_plural = "Master Token"
