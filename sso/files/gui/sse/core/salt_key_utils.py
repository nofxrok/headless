"""
    Utility to accept / reject / delete minion keys
"""

from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Q
from master.models import Master
import json
import logging

# logger settings
logger = logging.getLogger("sse.core")

class SaltKeyUtils(object):
    """
        Wrapper class to accept/reject/delete minion keys
    """

    def __init__(self, master=None):
        self.master_id = master

    def key_action(self, action, minion_id):
        '''
        Actions for a minion key
        '''
        try:
            self.master = Master.objects.get(id=self.master_id)
            self.master_token_obj = self.master.mastertoken_set.\
            filter(~Q(user__username="saltadmin"))[0]
        except ObjectDoesNotExist as err:
            logger.error('Object not found: {0}'.format(str(err)))
            return False

        key_call = {
            "fun": 'key.' + action,
            "client": "wheel",
            "match": minion_id
        }

        headers = {'X-Auth-Token': self.master_token_obj.token}

        try:
            response = self.master.api_post([key_call], headers)
            content = json.loads(response.read().decode('utf-8'))

            return content['return'][0]['data']['success']
        except Exception as error:
            logger.error("Error processing request %s. Please check the \
            salt-api logs" % error)
            return False

