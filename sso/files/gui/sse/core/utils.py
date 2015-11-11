'''
    Utility functions for code module
'''

import http.client
import json
import ssl

def _json_parser(content):
    '''
    parse the incoming content and return master info
    '''

    content = json.loads(content.decode("utf-8"))

    # Get master information
    master_info = content.get('return', [])

    if master_info:
        return master_info[0]
    else:
        return {}

def request(url, port, method, path, body=None, headers=None, **kwargs):
    '''
    Make a secure HTTPS request as JSON and return JSON

    This is a thin wrapper around http.client.HTTPSConnection to send/receive
    JSON and to bypass SSL verification and hostname verification. Works on
    Python 3.4 and 3.4.3.
    '''

    headers = headers or {'Accept': 'application/json',
                          'Content-Type': 'application/json',}

    ssl_config = {'check_hostname': False}

    if hasattr(ssl, '_create_unverified_context'):
        ssl_config['context'] = ssl._create_unverified_context()

    if not body is None:
        body = json.dumps(body)

    client = http.client.HTTPSConnection(url, port, **ssl_config)
    client.request(method, path, body, headers=headers)

    response = client.getresponse()

    if not str(response.status).startswith('2'):
        msg = 'Unsuccessful Response. Status: {0}'.format(response.status)
        raise Exception(msg)

    return response
