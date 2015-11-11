"""
    Master data serializers
"""

from .models import Master, MasterToken
from core.serializers import UserSerializer
from django.db import models
from django_pgjsonb import JSONField
from rest_framework import serializers
import json
from builtins import isinstance


class MasterSerializer(serializers.ModelSerializer):

    class Meta:
        model = Master
        fields = ('id', 'hostname', 'netapi_port', 'auth_mode')

    def validate_hostname(self, attrs, source):
        "Set a default role if needed."
        value = attrs[source]
        if self.Meta.model.objects.filter(hostname=value).exists():
            raise serializers.ValidationError("duplicate_master")
        return attrs


class MasterTokenSerializer(serializers.ModelSerializer):

    class Meta:
        model = MasterToken
        fields = ('id', 'master', 'allowed_functions', 'user', 'token')


class MasterTokenInfoSerializer(serializers.ModelSerializer):
    allowed_functions = models.TextField()
    user = UserSerializer(many=False, read_only=True)

    def transform_allowed_functions(self, obj, allowed_functions):
        try:
            return eval(allowed_functions)
        except:
            return []

    class Meta:
        model = MasterToken
        fields = ('allowed_functions', 'user')


class MasterDetailsSerializer(serializers.ModelSerializer):
    """
        serializer for master details
    """
    config = JSONField()
    mastertoken_set = MasterTokenInfoSerializer(many=True, read_only=True)

    def transform_config(self, obj, config):
        """
            transform config field in master model
        """
        # config = json.loads(config)
        if isinstance(config, dict):
            details = dict(event_return=config.get("event_return", 'Unknown'),
                           worker_threads=config.get("worker_threads", 'Unknown'),
                           pillar_version=config.get("pillar_version", 'Unknown'),
                           mysql_db=config.get("mysql.db", 'Unknown'),
                           mysql_host=config.get("mysql.host", 'Unknown'),
                           postgresql_db=config.get("returner.pgjsonb.db", 'Unknown'),
                           postgresql_host=config.get("returner.pgjsonb.host", 'Unknown'),
                           rest_cherrypy=config.get("rest_cherrypy", 'Unknown'),
                           file_roots=config.get("file_roots", 'Unknown'),
                           transport=config.get("transport", 'Unknown'),
                           key_logfile=config.get("key_logfile", 'Unknown'),
                           renderer=config.get("renderer", 'Unknown'),
                           max_event_size=config.get("max_event_size", 'Unknown'),
                           loop_interval=config.get("loop_interval", 'Unknown'),
                           master_job_cache=config.get("master_job_cache", 'Unknown'),
                           log_file=config.get("log_file", 'Unknown'),
                           interface=config.get("interface", 'Unknown'))
        else:
            details = dict()
        return details


    class Meta:
        model = Master
        fields = ('id', 'hostname', 'netapi_port', 'auth_mode', 'mastertoken_set', 'config')


class EditMasterSerializer(serializers.ModelSerializer):

    class Meta:
        model = Master
        fields = ('netapi_port', 'auth_mode')
