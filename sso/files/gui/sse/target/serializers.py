"""
    Serializers for Target App
"""
from .models import (Target, TargetMinions)
from minion.models import (Minion, MinionBeacon)
from rest_framework import serializers
from job.models import salt_returns
import os
import json


class TargetListSerializer(serializers.ModelSerializer):
    """
        Serializer for Target model
    """
    class Meta:
        model = Target
        fields = ('target_name', 'created_by', 'created_at', 'system_folder')

    def validate_target_name(self, attrs, source):
        """
            Check if a duplicate target entry is being made
        """
        value = attrs[source]
        if self.Meta.model.objects.filter(target_name=value,
                                          created_by=attrs['created_by'],
                                          system_folder=attrs['system_folder']).exists():
            raise serializers.ValidationError("duplicate_target_name")
        return attrs


class TargetMinionsSerializer(serializers.ModelSerializer):
    """
        TargetMinion serializer
    """
    id = serializers.RelatedField(source="minion")
    hostname = serializers.RelatedField(source="minion")
    minion_id = serializers.RelatedField(source="minion")
    config = serializers.RelatedField(source="minion")
    master = serializers.RelatedField(source="minion")
    is_minion_up = serializers.RelatedField(source="minion")
    last_seen = serializers.RelatedField(source="minion")
    key_status = serializers.RelatedField(source="minion")

    class Meta:
        model = TargetMinions
        fields = ("id", "hostname", "minion_id", "config", "master",
                  "is_minion_up", "last_seen", "key_status")

    def transform_id(self, obj, value):
        """
            transform minion id
        """
        return obj.minion.id

    def transform_hostname(self, obj, value):
        """
            transform minion hostname
        """
        return obj.minion.hostname

    def transform_minion_id(self, obj, value):
        """
            transform minion minion_id
        """
        return obj.minion.minion_id

    def transform_config(self, obj, value):
        """
            transform config field in Minion model
        """
        config = obj.minion.config
        target_groups = [target_minion.target.target_name \
                         for target_minion in \
                         TargetMinions.objects.filter(minion=obj.minion.id).exclude(target__target_name="")]
        # get latest job for a minion
        latest_job = salt_returns.objects.filter(full_ret__contains={'id':obj.minion.minion_id}).reverse()[:1]
        metadata = None
        latest_job_exec_time = None
        full_ret = None
        # retrieve full_ret and metadata
        if latest_job:
            try:
                full_ret = latest_job[0].full_ret
                if full_ret.get("fun_args") != []:
                    metadata = full_ret.get("fun_args")[0].get("metadata")
            except:
                metadata = None
        # retrieve latest jid if available
        if latest_job:
            latest_jid = latest_job[0].jid
        else:
            latest_jid = None
        # retrieve latest job execution time if available
        if metadata and "_TS" in metadata.keys():
            latest_job_exec_time = metadata.get("_TS")
        elif full_ret:
            latest_job_exec_time = full_ret.get("_stamp")
        details = dict(ip_interfaces=config.get("ip_interfaces", 'None'),
                       os=config.get("os", 'Unknown'),
                       cpuarch=config.get("cpuarch", 'Unknown'),
                       cpu_model=config.get("cpu_model", 'Unknown'),
                       num_gpus=config.get("num_gpus", 'Unknown'),
                       mem_total=config.get("mem_total", 'Unknown'),
                       saltversion=config.get("saltversion", 'Unknown'),
                       productname=config.get("productname", 'Unknown'),
                       zmqversion=config.get("zmqversion", 'Unknown'),
                       os_family=config.get("os_family", 'Unknown'),
                       osrelease=config.get("osrelease", 'Unknown'),
                       environment=target_groups,
                       latest_jid=latest_jid,
                       latest_job_exec_time=latest_job_exec_time
                       )
        return details

    def transform_master(self, obj, value):
        """
            transform minion master
        """
        return str(obj.minion.master)

    def transform_is_minion_up(self, obj, value):
        """
            transform is_minion_up
        """
        return obj.minion.is_minion_up

    def transform_last_seen(self, obj, value):
        """
            transform last_seen
        """
        return obj.minion.last_seen

    def transform_key_status(self, obj, value):
        """
            transform key_status
        """
        return obj.minion.key_status


class TargetBeaconsSerializer(serializers.ModelSerializer):
    """
        serializer for target beacons
    """
    id = serializers.RelatedField(source="beacon")
    name = serializers.RelatedField(source="beacon")
    file_path = serializers.RelatedField(source="beacon")
    description = serializers.RelatedField(source="beacon")
    created_by = serializers.RelatedField(source="beacon")
    created_at = serializers.RelatedField(source="beacon")

    class Meta:
        model = MinionBeacon
        fields = ("id", "name", "description", "file_path", "created_by",
                  "created_at")

    def transform_id(self, obj, value):
        """
            Transform the beacon id
        """
        return obj.beacon.id

    def transform_hostname(self, obj, value):
        """
            Transform the beacon name
        """
        return obj.beacon.name

    def transform_description(self, obj, value):
        """
            Transform the beacon description
        """
        return obj.beacon.description

    def transform_created_by(self, obj, value):
        """
            Transform the beacon created by
        """
        return obj.beacon.created_by.username

    def transform_created_at(self, obj, value):
        """
            Transform the beacon created at
        """
        return obj.beacon.created_at

    def transform_file_path(self, obj, value):
        """
            Transform the file field to send rel and abs path with other metadata
        """
        file_path = obj.beacon.file_path
        if os.path.exists(file_path) and os.path.isfile(file_path):
            size = os.stat(file_path).st_size
            filename = os.path.basename(file_path)
            content = open(file_path, "r").read()
            return dict(size=size, filename=filename, content=content)
        return None
