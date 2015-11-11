"""
Update presence and key status
for all minions
by processing presence, auth and key
events
"""

from django.conf import settings
from django.db.models import Q
from job.models import salt_events, salt_returns
from core.models import Beacon
from master.models import Master
from minion.event_processing import SaltMasterDM
import django
import json
import os
import sys

def get_auth_obj(master):
    """
    gets the object containing username and password
    """
    try:
        master_token_obj = master.mastertoken_set.filter(~Q(user__username="saltadmin"))[0]
    except IndexError:
        master_token_obj = None
    return master_token_obj

def get_salt_master_dm(master):
    """
        Get an object corresponding to the salt master
    """
    auth = get_auth_obj(master)

    if not auth:
        print('No MasterToken found for master {0}'.format(master))
        return False

    mst = SaltMasterDM(master.id, master.hostname, auth.token)
    return mst

def update_info():
    """
        updates minion grains and pillar checks for keys
    """

    for master in Master.objects.all():
        print("Updating grains and key")
        get_salt_master_dm(master).update_minions()

    purge_grains_items()

def process_presence_events():
    """
        Process presence events for all masters
    """
    try:
        presence_events = []

        for master in Master.objects.all():
            print ("=======================================")
            print("Master: {}".format(master.hostname))
            print ("Processing presence events")
            presence_events = (
                               salt_events.objects.filter(
                                                tag="salt/presence/present",
                                                master_id=master.id
                                                ).order_by("-id")
                               )

            if not presence_events:
                return

            latest_presence_event = presence_events[0]
            get_salt_master_dm(master).process_presence_event(latest_presence_event.data)
            # delete presence events we've already seen
            presence_events.delete()
    except Exception as err:
        print("Error [process_presence_events]: {0}".format(str(err)))

def process_auth_events():
    """
        Process auth events for all masters
    """

    try:
        auth_events = []

        for master in Master.objects.all():
            print("Processing auth events")
            auth_events = (
                salt_events.objects
                .filter(tag="salt/auth",
                        master_id=master.id)
                .order_by("-id")
            )

            if not auth_events:
                return

            seen = set()

            mst = get_salt_master_dm(master)
            for auth_event in auth_events:
                event_data = auth_event.data
                key = "{0} {1}".format(event_data["id"], event_data["act"])
                if key not in seen:
                    seen.add(key)
                    mst.process_auth_event(event_data)

            # delete all auth events handled so far
            auth_events.delete()
    except Exception as err:
        print("Error [process_auth_events]: {0}".format(str(err)))

def process_key_events():
    """
        Process auth events for all masters
    """

    try:
        key_events = []

        for master in Master.objects.all():
            print("Processing key events")
            key_events = (
                salt_events.objects
                .filter(tag="salt/key",
                        master_id=master.id)
                .order_by("-id")
            )
            if not key_events:
                return

            seen = set()

            mst = get_salt_master_dm(master)
            for key_event in key_events:
                event_data = key_event.data
                key = "{0} {1}".format(event_data["id"], event_data["act"])
                if key not in seen:
                    seen.add(key)
                    mst.process_key_event(event_data)

            # delete all key events handled so far
            key_events.delete()
    except Exception as err:
        print("Error [process_auth_events]: {0}".format(str(err)))

def purge_events():
    """
        Purge all events
    """

    print("salt_events table housekeeping")

    safe_list_id = []

    pattern_list = [r"salt/beacon/(.*)/%s/", r"salt/presence/present",
                 r"salt/auth", r"salt/key"]

    for pat in pattern_list:
        event_list = salt_events.objects.filter(
                                                tag__iregex=pat
                                                ).values_list("id", flat=True)
        safe_list_id.extend(event_list)

    salt_events.objects.exclude(id__in=safe_list_id).delete()

    print ("Entries cleaned")

def purge_grains_items():
    print("removing grains.items calls")
    salt_returns.objects.filter(fun='grains.items').delete()
    print("grains.items cleaned")

def process_all():
    """
        Process presence, auth and key elements and delete the rest
    """

    # to update that the minion is available
    process_presence_events()
    process_auth_events()
    process_key_events()
    update_info()
    purge_events()
    purge_grains_items()

