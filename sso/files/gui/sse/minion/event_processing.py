"""
    module to update minion data in DB
"""
import datetime
import json
import six

from django.utils import timezone

from core.models import Grains, GrainsValue
from core.utils import request
from minion.models import Master
from minion.models import Minion

class SaltMasterDM:
    """
        Class to hold the data model for a salt Master.
        Currently supported: Minions
    """

    def __init__(self, db_id, hostname, token):
        """
            Constructor
        """
        self.db_id = db_id
        self.hostname = hostname
        self.token = token
        self.master, _ = Master.objects.get_or_create(id=db_id)

    def _update_key_status(self, key_data):
        """
        {"data": {"_stamp": "2014-12-17T14:17:40.162561", "return": {"local": ["master.pem", "master.pub"],
        "minions_rejected": [], "minions": ["ubuntu1404"], "minions_pre": ["install"]},
        "fun": "wheel.key.list_all", "tag": "salt/wheel/20141217141740069481", "success": True,
        "jid": "20141217141740069481", "user": "vagrant"}, "tag": "salt/wheel/20141217141740069481"}
        """
        rejected = key_data["data"]["return"]["minions_rejected"]
        pending = key_data["data"]["return"]["minions_pre"]
        accepted = key_data["data"]["return"]["minions"]

        old = []
        for mid in rejected:
            mn_, cr = Minion.objects.get_or_create(minion_id=mid, master=self.master)
            mn_.key_status = Minion.REJECTED
            if cr or isinstance(mn_.config, str):
              mn_.config = {}
            mn_.save()
            old.append(mid)

        for mid in pending:
            mn_, cr = Minion.objects.get_or_create(minion_id=mid, master=self.master)
            mn_.key_status = Minion.PENDING
            if cr or isinstance(mn_.config, str):
              mn_.config = {}
            mn_.save()
            old.append(mid)

        for mid in accepted:
            mn_, cr = Minion.objects.get_or_create(minion_id=mid, master=self.master)
            mn_.key_status = Minion.ACCEPTED
            if cr or isinstance(mn_.config, str):
              mn_.config = {}
            mn_.save()
            old.append(mid)

        for mn_ in Minion.objects.filter(master=self.master).exclude(minion_id__in=old):
            mn_.key_status = Minion.DELETED
            mn_.save()

        print("Key data processed")
        print("Rejected Minions: %s" % rejected)
        print("Pending Minions: %s" % pending)
        print("Accepted Minions: %s" % accepted)

    def _attach_grains_to_minion(self, grains_data):
        """
            Update minion dict with grains
        """

        for mid, grains in six.iteritems(grains_data):

            if not grains:
                continue

            mn_, _ = Minion.objects.get_or_create(master=self.master, minion_id=mid)
            if grains == "{}" or grains == '"{}"':
                mn_.config = {}
            else:
                mn_.config = grains
            mn_.hostname = grains["ipv4"][-1]
            mn_.save()

            self.update_present([mid])

            # Let's leave the grains in the JSONField only
            #
            # for item in grains:
            #     # get or create Grains
            #     grain_obj, _ = Grains.objects.get_or_create(name=item)
            #     if isinstance(grains[item], str):
            #         # get or create GrainsValue
            #         grain_values_obj, _ = GrainsValue.objects.get_or_create(
            #                             grain=grain_obj, value=grains[item]
            #                             )
            # print("Grains stored: %s" % mid)

    def update_present(self, presents):
        """
            Update minions present
        """
        last_seen = timezone.now()
        known_to_db = Minion.objects.filter(
            minion_id__in=presents,
            master=self.master
            )
        known_to_db.update(is_minion_up=True,
                           last_seen=last_seen)

    def update_present_and_missing(self, presents):

        last_seen = timezone.now()
        known_to_db = Minion.objects.filter(
            minion_id__in=presents,
            master=self.master
        )
        known_to_db.update(is_minion_up=True,
                           last_seen=last_seen)

        minions = []
        # These are not already in the db and will need to be created
        for present in set(presents) - set([m.minion_id for m in known_to_db]):
            minions.append(Minion(minion_id=present,
                                  master=self.master,
                                  is_minion_up=True,
                                  last_seen=last_seen))

        if minions:
            Minion.objects.bulk_create(minions)

        # absent minions
        Minion.objects.filter(
            master=self.master
            ).exclude(
                minion_id__in=presents
                ).update(
                    is_minion_up=False
                    )

    def process_presence_event(self, event_info):
        """
            Check if any minions have connected or dropped.
            Send a message to the client if they have.
        """
        minions_detected = event_info["present"]
        print("Minions detected: %s" % minions_detected)
        self.update_present(minions_detected)

    def process_auth_event(self, event_data):
        """
        Handle salt/auth events
        """
        mid = event_data["id"]
        mn_, _ = Minion.objects.get_or_create(minion_id=mid, master=self.master)
        if mn_.key_status != Minion.ACCEPTED:
            mn_.key_status = Minion.PENDING
            mn_.is_minion_up = False
            mn_.save()
        print("Processed auth event for master = {0}".format(self.db_id))

    def process_key_event(self, event_data):
        """
        Handle salt/key events
        {"tag": "salt/key", "data": {"id": "ubuntu1404", "act": "delete",
        "_stamp": "2014-12-17T21:16:03.511531","result": True}}
        or
        {"tag": "salt/key", "data": {"result": True, "act": "accept",
        "_stamp": "2014-12-17T21:14:55.249690", "id": "ubuntu1404"}}
        """
        if not event_data["result"]:
            return

        mid = event_data["id"]
        mn_, _ = Minion.objects.get_or_create(minion_id=mid, master=self.master)
        if event_data["act"] == "accept":
            mn_.key_status = Minion.ACCEPTED
        elif event_data["act"] == "delete":
            mn_.key_status = Minion.DELETED
        mn_.save()
        print("Processed key event for master = {0}".format(self.db_id))

    def update_minions(self, tgt=None, expr_form=None):
        """
            Fill in grains and key data for minion
        """
        grains_call = {
            'fun': 'grains.items',
            'client': 'local',
            'tgt': tgt or '*',
            'expr_form': 'glob'
        }

        key_call = {
            "fun": "key.list_all",
            "client": "wheel",
        }

        if expr_form:
            grains_call.update({"expr_form": expr_form})

        data = [grains_call, key_call]
        headers = {'X-Auth-Token': self.token}

        try:
            response = self.master.api_post(data, headers)
            content = json.loads(response.read().decode('utf-8'))
            self._attach_grains_to_minion(content["return"][0])
            self._update_key_status(content["return"][1])
            present_minions = content['return'][0].keys()
            self.update_present_and_missing(present_minions)
        except Exception as err:
            print('Exception in update_minions request: {0}'.format(str(err)))


