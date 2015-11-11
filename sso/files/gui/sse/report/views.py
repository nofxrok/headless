'''
module to handle requests for report
'''

from django.conf import settings
from minion.models import Minion
from rest_framework import generics
from rest_framework import status
from rest_framework.response import Response
from target.models import Target
import datetime
import logging
import pytz


log = logging.getLogger(__name__)


class AllMinionReport(generics.ListAPIView):
    """
        API to list online, office and expired minions
        URL http://<hostname>/report/minion/all/
        Method: GET
        Returns data in the following format
    """

    def minion_connection_stats(self, minions):
        """
            To get a list of online, offline and expired minions
        """

        online_minions = list()
        offline_minions = list()
        expired_minions = list()

        for minion_obj in minions:

            # get UTC current date time
            current_datetime = datetime.datetime.utcnow()
            current_datetime = current_datetime.replace(tzinfo=pytz.utc)

            # get the last seen date time
            last_seen = minion_obj.last_seen

            # get the time difference
            try:
                delta_diff = current_datetime - last_seen
            except Exception as err:
                delta_diff = None

            if delta_diff:
                days_count = delta_diff.days
            else:
                # just to make sure if empty datetime is handled
                days_count = 99999

            # is minion up since x days
            if days_count >= settings.MINION_EXPIRY:
                expired_minions.append(minion_obj)

            # get a list of minions up
            elif minion_obj.is_minion_up:
                online_minions.append(minion_obj)

            # get all offline minions
            elif not minion_obj.is_minion_up:
                offline_minions.append(minion_obj)

        return dict(online_minions=len(online_minions),
                    expired_minions=len(expired_minions),
                    offline_minions=len(offline_minions))

    def minion_key_stats(self, minions):
        """
            To show the key stats for the minions
        """

        accepted_minions = list()
        deleted_minions = list()
        pending_minions = list()

        for minion_obj in minions:

            # get a list of accepted
            if minion_obj.key_status == 0: # accepted
                accepted_minions.append(minion_obj)

            # get a list of pending minion
            elif minion_obj.key_status == 1: # pending
                pending_minions.append(minion_obj)

            # get a list of deleted minions
            elif minion_obj.key_status == 3: # deleted
                deleted_minions.append(minion_obj)

        return dict(accepted_keys=len(accepted_minions),
                    pending_keys=len(pending_minions),
                    deleted_keys=len(deleted_minions))

    def minion_os_stats(self, minions):
        '''
        Get minion stats by OS
        '''
        os_count = list()

        os_list = list()
        os_list = [obj.config.get('os', 'Unknown') for obj in minions]
        unique_os_list = set(os_list)

        for os in unique_os_list:
            # extra check in case minions are created manually
            if os is not None:
                os_count.append(dict(name=os, count=os_list.count(os)))
            else:
                os_count.append(dict(name='Unknown', count=os_list.count(None)))

        return os_count

    def minion_version_stats(self, minions):
        '''
        Version count for each minion status
        '''

        version_count = list()

        version_list = [obj.config.get('saltversion', 'Unknown') for obj in minions]

        unique_version_list = set(version_list)

        for version in unique_version_list:
            # extra check in case minions are created manually
            if version:
                version_count.append(dict(version=version,
                                          count=version_list.count(version)))
            else:
                version_count.append(dict(version='Unknown',
                                          count=version_list.count(None)))

        return version_count

    def list(self, request, *args, **kwargs):
        """
            Send JSON statistics for AngularJS to consume
        """

        # get minions per target
        tid = self.request.QUERY_PARAMS.get("tid", None)

        # get minions per target
        qtid = self.request.QUERY_PARAMS.get("qtid", False)

        if tid:
            try:
                target_obj = Target.objects.get(id=tid)
            except:
                return Response(dict(error=["target_doesnot_exists"], data={}),
                                status=status.HTTP_400_BAD_REQUEST)

            minions = [obj.minion for obj in target_obj\
                       .targetminions_set.all()]

        elif qtid:
            try:
                target_obj = Target.objects.get(is_quick_target=True,
                                                target_name="",
                                                system_folder=None)
            except:
                return Response(dict(error=["qt_doesnot_exists"], data={}),
                                status=status.HTTP_400_BAD_REQUEST)
            minions = [obj.minion for obj in target_obj\
                       .targetminions_set.all()]

        else:
            # get total minion objects
            minions = Minion.objects.all()

        # get minion connections statistics
        minion_conn_stats = self.minion_connection_stats(minions)
        # get minion key statistics
        minion_key_stats = self.minion_key_stats(minions)
        # get minion os statistics
        minion_os_stats = self.minion_os_stats(minions)
        # get minion version statistics
        minion_version_stats = self.minion_version_stats(minions)

        return Response(dict(data=dict(minion_conn_stats=minion_conn_stats,
                                       minion_key_stats=minion_key_stats,
                                       minion_os_stats=minion_os_stats,
                                       minion_version_stats=minion_version_stats,
                                       total_minions=len(minions)),
                             error=[]), status=status.HTTP_200_OK)

