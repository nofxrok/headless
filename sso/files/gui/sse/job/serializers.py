"""
    Serializers for Job App
"""

from .models import (Module, Function, SLSInformation, Job, salt_returns, jids,
                     JobTargetMinion, salt_events)
from django.db import models
from rest_framework import serializers
from django_pgjsonb import JSONField


class ModuleSerialzer(serializers.ModelSerializer):
    """
        Serializer for Module Model
    """
    class Meta:
        model = Module
        fields = ('name',)


class FunctionSerializer(serializers.ModelSerializer):
    """
        Serializer for Function Model
    """
    module = ModuleSerialzer(read_only=True)

    class Meta:
        model = Function
        fields = ('name', 'module')


class SLSInformationSerializer(serializers.ModelSerializer):
    """
        Serializer for SLSInformation Model
    """

    class Meta:
        model = SLSInformation
        fields = ('name', 'filename', 'description', 'location', 'state_folder',
                  'created_by', 'created_at', 'file_type')


class JobTargetMinionSerializer(serializers.ModelSerializer):
    job = serializers.RelatedField()
    minion = serializers.RelatedField()

    class Meta:
        model = JobTargetMinion


class JobListSerializer(serializers.ModelSerializer):
    """
        Serializer for Job Model
    """

    jobtargetminion_set = JobTargetMinionSerializer(many=True, read_only=True)

    sls_info = serializers.RelatedField()
    modified_by = serializers.RelatedField()
    created_by = serializers.RelatedField()

    class Meta:
        model = Job
        fields = ('run_type', 'end_after', 'action_on_error', 'retry_option',
                  'execute', 'modified_by', 'created_at', 'modified_at',
                  'execute_at', 'created_by', 'priority', 'retry_count',
                  'sls_info', 'jobtargetminion_set')


class JobSerializer(serializers.ModelSerializer):
    """
        Serializer for Job Model
    """

    class Meta:
        model = Job
        fields = ('run_type', 'end_after', 'action_on_error', 'retry_option',
                  'execute', 'modified_by', 'created_at', 'modified_at',
                  'execute_at', 'created_by', 'priority', 'retry_count',
                  'sls_info', 'jobtargetminion_set')


class MinionJobHistorySerializer(serializers.ModelSerializer):
    """
        Serializer for Salt_return model
    """
    jid = models.CharField()
    full_ret = JSONField()

    def transform_jid(self, obj, jid):
        jid = jids.objects.get(jid=jid).load
        details = dict(user=jid.get("user"),
                       sls=jid.get("arg"))
        return details

    def transform_full_ret(self, obj, full_ret):
        # full_ret should already be a dict
        # full_ret = json.loads(full_ret)
        details = dict(success=full_ret.get("success"),
                       time_stamp=full_ret.get("_stamp")
                       )
        return details

    class Meta:
        model = salt_returns
        fields = ("full_ret", "jid",)


class SaltEventSerializer(serializers.ModelSerializer):
    '''
    Serializer for salt_events model
    '''
    class Meta:
        model = salt_events
        fields = ('id', 'tag', 'data', 'alter_time', 'master_id')
