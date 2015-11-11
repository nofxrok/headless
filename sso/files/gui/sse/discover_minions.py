import os
import sys
import django
import json

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "sse.settings")
sys.path.append(
    os.path.join(os.path.sep.join(os.getcwd().split(os.path.sep)[:-1]), "sse"))
django.setup()

from job.models import salt_returns
from minion.models import Minion
from master.models import Master


def parse_salt_returns():
    """
    """
    return_value_list = [obj.return_value for obj in salt_returns.objects.all()
                         if obj.fun == "grains.items" and obj.success == "1"]

    salt_return_list = [json.loads(ret_val) for ret_val in return_value_list]

    return salt_return_list


def add_minions(salt_return_list):
    """
    """
    for obj in salt_return_list:
        minion_hostname = obj.get("nodename")
        master_hostname = obj.get("master")
        master_obj = Master.objects.get(hostname=master_hostname)
        minion_obj, created = Minion.objects.get_or_create(
            hostname=minion_hostname,
            master=master_obj
        )
        minion_obj.config = obj
        minion_obj.save()

if __name__ == "__main__":
    salt_return_list = parse_salt_returns()
    add_minions(salt_return_list)
