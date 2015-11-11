import os
import sys
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "sse.settings")
sys.path.append(
    os.path.join(os.path.sep.join(os.getcwd().split(os.path.sep)[:-1]), "sse"))
django.setup()

from django.conf import settings
from core.models import Beacon
from django.contrib.auth.models import User

try:
    user = User.objects.get(id=1)
except:
    user = None
    exit(0)
    print("Exiting, no users available.")

beacon_folder_path = settings.BEACON_SCRIPT_LOCATION

beacons = [
{"name": "diskusage", "description": "Beacon to monitor disk usage.",},
{"name": "inotify", "description": "Watch files and translate the changes into salt events.",},
{"name": "journald", "description": "A simple beacon to watch journald for specific entries",},
{"name": "load", "description": "Beacon to emit system load averages",},
{"name": "network_info", "description": "Emit the network statistics of this host.",},
{"name": "service", "description": "Send events covering service status",},
{"name": "sh", "description": "Scan the shell execve routines. This beacon will convert all login shells",},
{"name": "twilio_txt_msg", "description": "Beacon to emit Twilio text messages",},
{"name": "wtmp", "description": "Beacon to fire events at login of users as registered in the wtmp file",},
]

for beacon in beacons:
    filepath = os.path.join(beacon_folder_path, beacon.get("name"), "%s.py" % beacon.get("name"))
    if os.path.exists(filepath) and os.path.isfile(filepath):
        beacon_obj, _ = Beacon.objects.get_or_create(name=beacon.get("name"),
                                                     description=beacon.get("description"),
                                                     file_path=filepath,
                                                     created_by=user)
        print("Beacon %s created" % beacon.get("name"))