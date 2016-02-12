'''
Module for submitting data to DataDog's Restufl API

:configuration: This module should be used to take in pillar data from a beacon
    From this data will will use datadogs libraries to submit to the API

Ensure your API is setup here
https://app.datadoghq.com/account/settings#api

The DataDog API Endpoint is here:
    https://app.datadoghq.com/api/

The Datadog API Documentation is here:
    http://docs.datadoghq.com/api/


This file should reside in the /srv/salt/_modules/datadog.py

'''

from __future__ import absolute_import

import logging


# Enable some logging
LOG = logging.getLogger(__name__)

# Import Salt Modules
import salt.utils


# Next import the API Key from the Pillar data and initialize connection

# Define the modules virtual name

__virtualname__ = 'datadog'


# Try to import the Datadog modules
try:
    from datadog import initialize, api
    HAS_DATADOG = True
except ImportError:
    HAS_DATADOG = False

def __virtual__():
    if not HAS_DATADOG:
        return False
    return __virtualname__


'''
  The sendmsg function will take in data from the state calling this module.
  The function will take in the following data:


    Example Beacon Structure message for a file change:
    -----

salt/beacon/datadoggy/inotify//etc/ntp.conf     {
    "_stamp": "2016-02-04T15:48:53.379702",
    "data": {
        "change": "IN_IGNORED",
        "id": "datadoggy",
        "path": "/etc/ntp.conf"
    },
    "tag": "salt/beacon/datadoggy/inotify//etc/ntp.conf
}
'''

def filechange(name, changetype, minion, path, api_key):

    '''
    File change function to push to the API of your datadog environment
    This will take in the data pushed in the inotify setting of the inotify beacon

    State  Example:

    "Datadog Filechange example":
      datadog.filechange
        - name: 'DataDog API Call'
        - changetype: IN_IGNORED
        - minion: minion
        - path: /etc/ntp.conf
        - api_key: "api_key: {{ pillar['datadog']['api_key'] }}"

    '''

  # Initialize the Connection to your datadog with the passed API Key from the state

    initialize(api_key)

    tags = [changetype, 'Saltstack File Change', 'Salt', 'Beacon']

    # Now send the API Event

    api.Event.create(title=minion, text=path, tags=tags)


    ret = {'name': name,
           'changes': {},
           'result': None,
           'comment': ''}


    ret['changes'] = {'results': '{0} Completed'.format(name)}
    ret['result'] = True
    ret['comment'] = 'Data Posted to DataDog'


    return ret

def service(name, service, minion, running, api_key):

    '''
    Service Status Change function to push to the API of your datadog environment
    This will take in the data pushed from the service monitoring beacon

    State  Example:

    "Datadog Service example":
      datadog.service
        - name: 'DataDog Service API Call'
        - changetype:
        - minion: minion
        - path: /etc/ntp.conf
        - api_key: "api_key: {{ pillar['datadog']['api_key'] }}"

    '''

  # Initialize the Connection to your datadog with the passed API Key from the state
  # Initialize the Connection to your datadog with the passed API Key from the state

    initialize(api_key)

    tags = [changetype, 'Saltstack File Change', 'Salt', 'Beacon']

    # Now send the API Event

    api.Event.create(title=minion, text=path, tags=tags)


    ret = {'name': name,
           'changes': {},
           'result': None,
           'comment': ''}


    ret['changes'] = {'results': '{0} Completed'.format(name)}
    ret['result'] = True
    ret['comment'] = 'Data Posted to DataDog'


    return ret
