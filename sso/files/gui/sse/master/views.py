"""
    Views to handle all request response related objects with respect to master
"""
import json
import logging
import socket

from django.conf import settings
from django.db import transaction
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist
from netifaces import interfaces, ifaddresses, AF_INET
from rest_framework import generics
from rest_framework import status
from rest_framework.response import Response

from core.utils import _json_parser
from master.service import Login
from master.models import Master, MasterToken
from master.serializers import (MasterSerializer, MasterTokenSerializer,
                                MasterDetailsSerializer, EditMasterSerializer)

logger = logging.getLogger("sse.master")


class MasterView(generics.ListCreateAPIView):

    """
        View to create master in the database
    """

    @transaction.commit_manually
    def post(self, request):
        """
            Use the post parameters to validate the values against serializer
            and create entries in the Master table
            Parameters:
                        {
                            "hostname": <hostname>,
                            "netapi_port": <netapi_port>,
                            "auth_mode": <auth_mode>,
                            "master_username": <master_username>,
                            "master_password": <master_password>
                        }
            API: http://<hostname>/master/add/
            Please make sure to add auth token in the headers. Once the master is
            added successfully, code will try to login to the master and see if
            the host is up.
        """
        # Test if master is reachable
        validation_status, response_code, message, content = validate_host(request.DATA)

        # Master created successfully but login was unsuccessful
        if not validation_status and response_code == 401:
            transaction.rollback()
            return Response(dict(error=["invalid_master_credentials"],
                            data={}),
                            status=status.HTTP_401_UNAUTHORIZED)

        # Unable to reach master
        elif not validation_status and response_code == 400 and message == "duplicate_master":
            transaction.rollback()
            return Response(dict(error=["duplicate_master"],
                            data={}),
                            status=status.HTTP_400_BAD_REQUEST)

        # Unable to reach master
        elif not validation_status and response_code == 400:
            transaction.rollback()
            return Response(dict(error=["no_route_to_host"],
                            data={}),
                            status=status.HTTP_400_BAD_REQUEST)

        # If yes, create an entry in master and master token table
        elif validation_status and response_code == 200:
            serializer = MasterSerializer(data=request.DATA)
            if serializer.is_valid():
                serializer.object.created_by = serializer.object.modified_by = request.user
                serializer.save()

                try:
                    salt_user = User.objects.get(username=request.DATA['master_username'])
                except ObjectDoesNotExist:
                    salt_user = User.objects.create_user(username=request.DATA['master_username'],
                                                         password=request.DATA['master_password'])

                # Add Master Token Data
                token_serializer = MasterTokenSerializer(data={
                    'master': serializer.object.id,
                    'user': salt_user.id,
                    'allowed_functions': content.get('perms', []),
                    'token': content.get('token', None)
                })

                if not token_serializer.is_valid():
                    # roll back db created values in case there are any errors
                    transaction.rollback()
                    return Response(dict(error=token_serializer.errors, data={}),
                                    status=status.HTTP_400_BAD_REQUEST)

                token_serializer.save()

                response_dict = dict(hostname=serializer.object.hostname,
                                     netapi_port=serializer.object.netapi_port,
                                     eauth=serializer.object.auth_mode,
                                     allowed_function=token_serializer.object.allowed_functions)

                wheel_call_status = self._set_master_config(serializer.object, request.DATA)

                if not wheel_call_status:
                    # delete the entries created in the db in case there is an error
                    transaction.rollback()
                    return Response(dict(error=["wheel_call_error"], data={}),
                                    status=status.HTTP_400_BAD_REQUEST)

                # set master config in DB
                set_config_status, master_config = self._set_master_details(serializer.object, request.DATA)

                if not set_config_status:
                    # delete the entries created in the db in case there is an error
                    transaction.rollback()
                    return Response(dict(error=["master_set_config_error"], data={}),
                           status=status.HTTP_400_BAD_REQUEST)

                serializer.object.config = master_config
                master = serializer.save()

                try:
                    sync_call_resp = master.sync_all_grains() # fix for 1102
                except Exception as err:
                    logger.error('Error:{0} while trying to sync grains for master: {1}'.format(err, master))
                    transaction.rollback()
                    return Response(dict(error=['sync_grains_error'], data={}),
                                    status=500)

                # if all is success, commit the transaction
                transaction.commit()

                return Response(dict(error=[], data=response_dict), status=status.HTTP_200_OK)
            else:
                # delete the entries created in the db in case there is an error
                transaction.rollback()
                # Error processing
                error_list = [
                    e for error in serializer.errors.values() for e in error]
                return Response(dict(error=error_list, data={}), status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(dict(error=["error"], data={}), status=status.HTTP_400_BAD_REQUEST)

    def _set_master_details(self, master_obj, request_obj):
        """
            Make a wheel call with low state to set the master details in DB
            {
                "fun": "config.values",
                "client": "wheel"
            }
        """
        wheel_data = dict(fun="config.values", client="wheel")
        master_token = MasterToken.objects.get(master=master_obj).token

        try:
            headers = {
                'X-Auth-Token': master_token
            }

            resp = master_obj.api_post(wheel_data, headers)
        except Exception as error:
            logger.critical("Error processing request %s. Please check salt-api logs." % error)
            return False, dict()

        if resp.status == 200:
            return True, json.loads(resp.read().decode('utf-8'))['return'][0]['data']['return']
        else:
            return False, {}

    def _set_master_config(self, master_obj, request_obj):
        """
            Make a wheel call with username, password, eauth and low state to
            set the master PK in the configuration file
            {
                "username": "username",
                "password": "password",
                "fun": "config.update_config",
                "file_name": "gui",
                "yaml_contents": {
                    "id": master pk
                },
                "client": "wheel",
                "eauth": "pam"
            }
        """
        username = request_obj.get("master_username", None)
        password = request_obj.get("master_password", None)
        eauth = request_obj.get("auth_mode", None)

        wheel_data = dict(username=username, password=password, eauth=eauth,
                          fun="config.update_config", file_name="gui",
                          yaml_contents=dict(id=master_obj.id),
                          client="wheel")

        try:
            resp = master_obj.api_request('POST',
                                          '/run',
                                          wheel_data)
        except Exception as err:
            msg = 'Error process request {0}'.format(str(error))
            logger.error(err)
            return False

        if resp.status == 200:
            logger.info("Request processed successfully.")
            return True
        else:
            logger.debug('Failed with {0}'.format(str(resp.status)))
            return False


def _interface_check(hostname):
    """
        Check the interfaces file to see if duplicate masters cannot be
        added to the system.
        Steps
        1. Get all ip address from interfaces
        2. Check if the hostname given by user exists in ip list
        3. If False, that means ip is new, proceed with next function call
        4. If True, remove that ip address from the list and check if
           other remaining ip is present in the database.
        5. If True, return duplicate_master else proceed with next function
    """

    ip_list = ["localhost", "0.0.0.0", socket.gethostname()]

    for interface in interfaces():
        # Not all interfaces have AF_INET
        links = ifaddresses(interface)
        if AF_INET in links:
            for link in links[AF_INET]:
                ip_list.append(link['addr'])

    if hostname in ip_list:
        ip_list.remove(hostname)
    else:
        return True

    master_obj_list = Master.objects.filter(hostname__in=ip_list)

    if master_obj_list:
        return False
    else:
        return True


def validate_host(request_data):
    """
        To validate that the added URL is online
    """

    hostname = request_data.get("hostname", None)
    netapi_port = request_data.get("netapi_port", None)
    username = request_data.get("master_username", None)
    password = request_data.get("master_password", None)
    eauth = request_data.get("auth_mode", None)

    # check to see if interface file has multiple declarations
    # True, IP is new, False, IP already present in the database
    interface_check_status = _interface_check(hostname)
    if not interface_check_status:
        return False, 400, "duplicate_master", None

    login_obj = Login(
        username, password, hostname, netapi_port, eauth)
    status, response_code, message, content = login_obj.login()

    if status and response_code == 200:
        content = _json_parser(content)
        return status, response_code, message, content

    elif not status and (response_code == 401 or response_code == 400):
        return status, response_code, message, content


class MasterList(generics.ListAPIView):

    """
        List down all the masters view class
    """
    serializer_class = MasterDetailsSerializer

    def get_queryset(self):
        """
            get query set
        """
        return Master.objects.all()

    def list(self, request, *args, **kwargs):
        """
            send custom response using overriding the list method
        """
        response = generics.ListAPIView.list(
            self, request, *args, **kwargs).data
        # variable to retrieve pagination number
        paginator = self.paginate_queryset(self.object_list)
        # set next and previous page numbers
        try:
            response.update({"next_page_number": paginator.next_page_number()})
        except:
            response.update({"next_page_number": None})
        try:
            response.update({"previous_page_number": paginator.previous_page_number()})
        except:
            response.update({"previous_page_number": None})
        try:
            response.update({"total_page_number": paginator.paginator._get_num_pages()})
        except:
            response.update({"total_page_number": None})
        return Response(dict(data=response, error=[]), status=status.HTTP_200_OK)


class MasterObject(generics.ListAPIView):
    serializer_class = MasterDetailsSerializer
    """
        Get master object and return the response
    """

    def get_queryset(self):
        """
            get query set
        """
        hostname = self.kwargs['hostname']
        return Master.objects.filter(hostname=hostname)

    def list(self, request, *args, **kwargs):
        """
            send custom response using overriding the list method
        """
        response = generics.ListAPIView.list(
            self, request, *args, **kwargs).data
        return Response(dict(data=response, error=[]), status=status.HTTP_200_OK)


class DeleteMasters(generics.GenericAPIView):

    """
        View to delete the masters
    """

    def post(self, request):
        """
            Submit a POST request with hostnames to be deleted from the database.
            Parameters: {"h1": "localhost", "h2": "127.0.0.1"}
            API: http://<hostname>/master/delete/
            Response Data: {"status": 200, "error": [], "data": {"results": {"deleted_masters": ["127.0.0.1"]}}}
        """
        deleted_masters = []

        self.user_obj = self.request.user

        master_hostnames = request.DATA.values()

        for hostname in master_hostnames:
            try:
                master_obj = Master.objects.get(hostname=hostname)
            except:
                master_obj = None

            if master_obj:
                deleted_masters.append(master_obj.hostname)
                master_obj.delete()

        return Response(dict(
            error=[], data=dict(results=dict(deleted_masters=deleted_masters)),
            status=status.HTTP_200_OK
        ))


class EditMasterView(generics.ListCreateAPIView):

    """
        View to edit master in the database
    """

    def post(self, request, hostname):
        """
            Use the post parameters to validate the values against serializers
            and edit entries in the Master table
            Parameters:
                        {
                            "hostname": <hostname>,
                            "netapi_port": <netapi_port>,
                            "auth_mode": <auth_mode>,
                            "master_username": <master_username>,
                            "master_password": <master_password>
                        }
            API: http://<hostname>/master/<hostname>/edit/
            Please make sure to add auth token in the headers. Once the master is
            added successfully, code will try to login to the master and see if
            the host is up.
        """

        self.user_obj = self.request.user

        # Check if master with this hostname already exists or not
        try:
            master_obj = Master.objects.get(hostname=hostname)
        except:
            return Response(dict(error=["master_doesnot_exists"], data={}), status=status.HTTP_400_BAD_REQUEST)

        # Test if master is reachable
        validation_status, response_code, message, content = validate_host(
            request.DATA)

        # Master created successfully but login was unsuccessful
        if not validation_status and response_code == 401:
            return Response(dict(error=["invalid_master_credentials"], data={}), status=status.HTTP_401_UNAUTHORIZED)

        # Unable to reach master
        elif not validation_status and response_code == 400:
            return Response(dict(error=["no_route_to_host"], data={}), status=status.HTTP_401_UNAUTHORIZED)

        # If yes, create an entry in master and master token table
        elif validation_status and response_code == 200:
            serializer = EditMasterSerializer(data=request.DATA)
            if serializer.is_valid():
                Master.objects.filter(hostname=hostname).update(**{
                    "hostname": request.DATA.get("hostname", None),
                    "netapi_port": request.DATA.get("netapi_port", None),
                    "auth_mode": request.DATA.get("auth_mode", None),
                    "modified_by": self.user_obj,
                }
                )

                return Response(dict(error=[], data={}), status=status.HTTP_200_OK)
            else:
                return Response(dict(error=serializer.errors, data={}), status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(dict(error=["error"], data={}), status=status.HTTP_400_BAD_REQUEST)

