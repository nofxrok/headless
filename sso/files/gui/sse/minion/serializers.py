"""
    Minion data Serializers
"""

from .models import Minion
from django_pgjsonb import JSONField
from rest_framework import serializers
from target.models import TargetMinions, Target
from job.models import salt_returns
import json

import logging

log = logging.getLogger(__file__)


class MinionSerializer(serializers.ModelSerializer):
    """
        serializer for Minion Model
    """
    # config = JSONField()
    master = serializers.RelatedField(source="master")

    def transform_config(self, obj, config):
        """
            transform config field in Minion model
        """

        target_groups = [target_minion.target.target_name \
                         for target_minion in \
                         TargetMinions.objects.filter(minion=obj.id).exclude(target__target_name="")]
        # get latest job for a minion
        latest_job = salt_returns.objects.filter(full_ret__contains={'id': obj.minion_id}).reverse()[:1]
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
        details = dict(ip_interfaces=obj.config.get("ip_interfaces", 'None'),
                       os=obj.config.get("os", 'Unknown'),
                       cpuarch=obj.config.get("cpuarch", 'Unknown'),
                       cpu_model=obj.config.get("cpu_model", 'Unknown'),
                       num_gpus=obj.config.get("num_gpus", 'Unknown'),
                       mem_total=obj.config.get("mem_total", 'Unknown'),
                       saltversion=obj.config.get("saltversion", 'Unknown'),
                       productname=obj.config.get("productname", 'Unknown'),
                       zmqversion=obj.config.get("zmqversion", 'Unknown'),
                       os_family=obj.config.get("os_family", 'Unknown'),
                       osrelease=obj.config.get("osrelease", 'Unknown'),
                       environment=target_groups,
                       latest_jid=latest_jid,
                       latest_job_exec_time=latest_job_exec_time
                       )
        return details

    class Meta:
        model = Minion
        fields = ("id", "hostname", "minion_id", "config", "master", "is_minion_up", "last_seen", "key_status")

