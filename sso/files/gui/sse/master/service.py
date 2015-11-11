"""
    Service layer for salt api
"""

from django.conf import settings

from urllib.parse import urlencode
from .models import Master, MasterToken
from core.utils import request as ss_request
import json
import logging


class Login(object):

    '''
    Wrapper around salt api login for masters
    '''
    def __init__(self, username, password, hostname, netapi_port, auth_mode):
        '''
        Constructor
        '''
        self.username = username
        self.password = password
        self.hostname = hostname
        self.netapi_port = netapi_port
        self.eauth = auth_mode

    def login(self):
        '''
        Login service
        '''
        auth_data = {
            'username': self.username,
            'password': self.password,
            'eauth': self.eauth
        }

        try:
            response = ss_request(self.hostname,
                                  self.netapi_port,
                                  'POST',
                                  '/login/',
                                  auth_data)
        except Exception as err:
            return False, 400, "no_route_to_host", {}

        if response.status == 200:
            return True, 200, "authentication_successful", response.read()

        elif response.status == 401:
            return False, 401, "unauthorized_access", {}

        else:
            return False, 400, "bad_request", {}


class LowDataAdapter(object):

    """
        Wrapper around saltapi.netapi.rest_cherrypy.app.LowDataAdapter for executing commands
    """

    def __init__(self, user_obj, mid, fun, tgt, client):
        """
            Constructor
        """

        self.user_obj = user_obj
        self.mid = mid
        self.fun = fun
        self.client = client
        self.tgt = tgt

    def controller(self):
        """
            Main controller for calling the API with low state data
        """

        # Get master object
        self.get_master_obj()

        # Get master token object
        self.get_master_token_obj()

        # Using generated token, call the API with low state data
        response, message, content = self.execute_api()

        if response:
            # Process the response data from the REST API call
            message, status_code = self.process_response(response, content)
            return message, status_code
        else:
            # Was unable to access salt URL or the access to the URL was denied
            # or master doesnot exists
            return message, 400

    def get_master_obj(self):
        """
            Method to get master object
        """

        try:
            self.master_obj = Master.objects.get(id=self.mid)
        except:
            self.master_obj = None

    def get_master_token_obj(self):
        """
            Method to get master token details
        """

        try:
            self.master_token_obj = MasterToken.objects.get(
                user=self.user_obj, master=self.master_obj)
        except:
            self.master_token_obj = None

    def execute_api(self):
        """
            Create URL and call the API with low state data. Authentication token is passed as header object.
        """
        if not self.master_obj:
            return False, "master_doesnot_exists", {}

        content = None
        data = {"fun": self.fun, "client": self.client, "tgt": self.tgt}

        try:
            headers={"Content-Type": "application/x-www-form-urlencoded",
                      "X-Auth-Token": self.master_token_obj.token}
            response = self.master_obj.api_post(data, headers)
            content = response.read().decode("utf-8")
        except Exception as error:
            return False, error, {}

        if content:
            content = json.loads(content)

        return response, "", content

    def process_response(self, response, content):
        """

        """

        if "status" in content:
            if not content["status"]:
                return "unauthorized access", 401
        else:
            return "success", 200
