#!/usr/bin/python3
# -*- coding: utf-8 -*-

"""
    Views to handle core related request response objects.
"""

from .salt_key_utils import SaltKeyUtils
from django.db import connection
from core.models import SystemFolder, Grains, GrainsValue, Beacon, GlobalConfig
from core.serializers import (UserDetailSerializer, EditUserSerializer,
                              BeaconSerializer, BeaconUploadSerializer)
from core.utils import _json_parser
from datetime import timedelta
from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist
from itertools import chain
from master.models import Master, MasterToken
from master.service import Login
from minion.models import (Minion, MinionBeacon)
from minion.serializers import MinionSerializer
from job.models import salt_events
from mptt.templatetags.mptt_tags import cache_tree_children
from rest_framework import generics, filters
from rest_framework import status
from rest_framework import views
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from target.models import (Target, TargetMinions, UserFavorites)
from target.serializers import TargetListSerializer
from collections import defaultdict
import json
import datetime
import logging
import pytz
import py_compile
import re
import os

# logger settings
logger = logging.getLogger("sse.core")


class AuthTokenUtils(object):

    """
        Class for common methods
        1. authenticate user token
        2. authenticate master : check if a user can be logged into any one of the masters
        3. add master token
    """

    def authenticate_user_token(self, userobj):
        """
            Generate a new token for each user and check the validity of the token.
            If the token has expired, generate a new token and return the new value.
        """

        try:
            time_period = int(GlobalConfig.objects.get(name="token_exp").value)
        except:
            time_period = 60

        # First time token generation
        token_obj, created = Token.objects.get_or_create(user=userobj)
        if token_obj and created:
            return token_obj

        # This is required for the time comparison
        utc_now = datetime.datetime.utcnow()
        utc_now = utc_now.replace(tzinfo=pytz.utc)

        # The token has expired, generate a new token and return the token
        # object
        if token_obj and token_obj.created < utc_now - timedelta(minutes=time_period):
            token_obj.delete()
            token_obj = Token.objects.create(user=userobj)
            return token_obj

        # No change, return the token as it is
        return token_obj

    def authenticate_master(self, master_obj_list, username, password):
        """
            To check if user can logged into any on of the masters
        """

        login_details = []

        # Get all master list to validate the user

        for master_obj in master_obj_list:
            obj = Login(username, password, master_obj.hostname,
                        master_obj.netapi_port, master_obj.auth_mode)
            status, response_code, message, content = obj.login()
            # Just consider 200 status and ignore the others
            if status and response_code == 200:
                content = _json_parser(content)
                login_details.append([content.get("token", None), content.get(
                    "perms", None), message, 200, master_obj, ])

        if login_details:
            return True, login_details
        else:
            return False, login_details


class AuthenticateUserView(views.APIView):

    """
        View to authenticate user
    """

    # Public access to login view
    permission_classes = (AllowAny,)

    def post(self, request):
        """
            Get the username and password from POST request and validate user against the master, if
            the authentication is successful, check if user exists in django database, if not add a
            new user in the database.
            URL: http://<hostname>/core/login/
            Parameters:
                        {
                            "username": <username>,
                            "password": <password>,
                        }
            To test this, please make sure the specified master is up and running and
            CherryPy NETApi server is up and running sudo salt-api.
        """

        # Get the POST parameters from the parsed JSON
        self.username = request.DATA.get("username")
        self.password = request.DATA.get("password")

        if not self.username or not self.password:
            logger.error("Empty username or password entered")
            return Response(dict(error=["username_password_empty"], data={}, status=status.HTTP_400_BAD_REQUEST))

        # User authentication against django database
        self.userobj = authenticate(username=self.username, password=self.password)

        # Get a list of all the connected masters
        master_obj_list = Master.objects.all()
        authtokenutils = AuthTokenUtils()

        if self.userobj:
            # Check existing token and generate new token of existing token has expired
            user_auth_token = authtokenutils.authenticate_user_token(self.userobj)
            if not master_obj_list:
                logger.error("No masters are connected. Allow admin to add master in the system.")
                # Since no masters are connected, considering an admin has logged in, return token
                # so that a user can add a new master in the database
                return Response(
                    dict(error=["no_masters_connected"], data=dict(
                        username=self.username,
                        token=user_auth_token.key,
                        is_staff=self.userobj.is_staff)), status=status.HTTP_200_OK)

        # Authenticate the user on the master, if it exists, generate and save token
        login_status, self.login_details = authtokenutils.authenticate_master(master_obj_list,
                                                                              self.username, self.password)

        if login_status:
            logger.info("Master credentials validated successfully.")
            """
                Case 1: User exists on master, if doesn't exists in django database, create a new user in
                django database. If already exists, check for token expiry and generate a new one if the
                existing token has expired.
            """
            # User exists on master but doesn't exists in django db, create new user in django db
            if not self.userobj:
                logger.info("Create new user %s in the system." % self.username)
                self.userobj = User.objects.create_user(username=self.username, password=self.password)
                self.userobj.userprofile.is_superuser = True
                self.userobj.userprofile.save()
            # Generate new django token for newly created user or update it for the existing user
            user_auth_token = authtokenutils.authenticate_user_token(self.userobj)
            # Save salt api token in the database
            token_status = self.add_master_token()
            if not token_status:
                logger.error("Failed to generate master token")
                return Response(dict(error=["master_token_not_saved"], data={}, status=status.HTTP_400_BAD_REQUEST))
            return Response(dict(error=[], data=dict(username=self.username, token=user_auth_token.key)),
                            status=status.HTTP_200_OK)
        elif not login_status and self.userobj and self.userobj.userprofile.is_superuser:
            """
                Case 2: User doesn't exists on the master however it is a superuser, in this case, check for the django
                token and regenerate if the token has expired and store it in the database
            """
            logger.info("Superuser logged in which doesn't exists on the master.")
            user_auth_token = authtokenutils.authenticate_user_token(self.userobj)
            return Response(dict(error=[], data=dict(username=self.username, token=user_auth_token.key)),
                            status=status.HTTP_200_OK)
        else:
            """
                Case 3: User does not exists on master or django database, in this case, return unauthorized access.
            """
            logger.error("Unauthorized access with username %s." % self.username)

            return Response(dict(error=["unauthorized_access"], data={}), status=status.HTTP_401_UNAUTHORIZED)

    def add_master_token(self):
        """
            To create master token entry in the database. Salt API itself maintains the history of token expiry.
            If token has expired and user tries to login with correct cred, a new token is generated and is updated
            in MasterToken table.
        """
        try:
            for item in self.login_details:
                token = item[0]
                allowed_methods = item[1]
                master_obj = item[4]

                master_token_obj, created = MasterToken.objects.get_or_create(
                    master=master_obj, user=self.userobj)

                master_token_obj.has_expired = False
                master_token_obj.created_at = datetime.datetime.now()
                master_token_obj.token = token
                master_token_obj.allowed_functions = allowed_methods
                master_token_obj.save()
            return True
        except:
            return False


class UserListView(generics.ListAPIView):
    """
        View to authenticate user
    """
    serializer_class = UserDetailSerializer

    def get_queryset(self):
        """
            get all Users query set
        """
        return User.objects.all()

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


class UserView(views.APIView):

    """
        View to create a user
    """

    def post(self, request):
        """
            Using POST parameters, get the new user details.
            Check if the new user can be logged into any of the masters.
            If yes create an entry in the User table for the new user
            URL: http://<hostname>/core/users/add/
            Parameters:
                        {
                            "username":<username>,
                            "password":<password>,
                            "first_name":<first_name>,
                            "last_name":<last_name>,
                            "email":<email>,
                            "type":<type_of_user> #can be one of normal, admin, superuser
                        }
        """

        master_obj_list = Master.objects.all()

        self.username = request.DATA.get("username", None)
        self.password = request.DATA.get("password", None)
        self.first_name = request.DATA.get("first_name", None)
        self.last_name = request.DATA.get("last_name", None)
        self.email = request.DATA.get("email", None)
        self.type = request.DATA.get("type", None)

        # Check for username, first name and last name must be alphanumeric
        if not self.username.isalnum():
            return Response(dict(error=['username_alphanumeric'],
                                 data=dict(username=self.username)),
                            status=status.HTTP_400_BAD_REQUEST)

        if not self.first_name.isalnum():
            return Response(dict(error=['firstname_alphanumeric'],
                                 data=dict(first_name=self.first_name)),
                            status=status.HTTP_400_BAD_REQUEST)

        if not self.last_name.isalnum():
            return Response(dict(error=['lastname_alphanumeric'],
                                 data=dict(last_name=self.last_name)),
                            status=status.HTTP_400_BAD_REQUEST)

        # Authenticate the user on the master, if it exists, generate and save token
        authtokenutils_obj = AuthTokenUtils()
        login_status, self.login_details = authtokenutils_obj.authenticate_master(master_obj_list,
                                                                                  self.username, self.password)

        # If user belongs to superuser group, create user irrespective of its existence on master
        if self.type in settings.SUPERUSER_GROUPS:
            ret_status, message = self.create_superuser(authtokenutils_obj)
            if not ret_status:
                return Response(dict(error=[message], data=dict(username=self.username)),
                                status=status.HTTP_400_BAD_REQUEST)
        elif not login_status:
            logger.error("Unable to create user %s. Authentication failed on master." % self.username)
            return Response(dict(error=["unauthorized_access"], data={}), status=status.HTTP_401_UNAUTHORIZED)

        elif login_status:
            try:
                user_obj = User.objects.get(username=self.username)
            except:
                user_obj = None

            if user_obj:
                logger.error("User with username %s already exists." % self.username)
                return Response(dict(error=["user_already_exists"],
                                     data=dict(username=self.username)), status=status.HTTP_400_BAD_REQUEST)

            self.userobj = User.objects.create_user(username=self.username, email=self.email, password=self.password)
            self.userobj.first_name = self.first_name
            self.userobj.last_name = self.last_name
            self.userobj.save()

            user_auth_token = authtokenutils_obj.authenticate_user_token(userobj=self.userobj)
            # Update the type of the user based on the type of the user
            self.save_user_profile(self.type)
        response_dict = dict(username=self.userobj.username, first_name=self.userobj.first_name,
                             last_name=self.userobj.last_name, email=self.userobj.email, type=self.type)
        return Response(dict(error=[], data=response_dict), status=status.HTTP_200_OK)

    def create_superuser(self, authtokenutils_obj):
        """
            Method to create a superuser. While creating a superuser
            he should not be authenticated against masters, the superuser should be created stright away
        """
        try:
            user_obj = User.objects.get(username=self.username)
        except:
            user_obj = None

        if user_obj:
            logger.error("User with username %s already exists." % self.username)
            return False, "user_already_exists"
        else:
            self.userobj = User.objects.create_user(username=self.username,
                                                    email=self.email, password=self.password)
            self.userobj.first_name = self.first_name
            self.userobj.last_name = self.last_name
            self.userobj.save()
            logger.error("User with username %s created successfully." % self.username)
            user_auth_token = authtokenutils_obj.authenticate_user_token(userobj=self.userobj)
            self.save_user_profile(self.type)
            return True, None

    def save_user_profile(self, user_type):
        """
            save the type of the user using the userobj provided
        """
        if user_type == 'user':
            self.userobj.userprofile.is_user = True
            self.userobj.userprofile.save()
        elif user_type == 'superuser':
            self.userobj.userprofile.is_superuser = True
            self.userobj.userprofile.save()
        elif user_type == 'admin':
            self.userobj.userprofile.is_admin = True
            self.userobj.userprofile.save()

    def add_master_token(self):
        """
            create master token
        """
        try:
            for item in self.login_details:
                token = item[0]
                allowed_methods = item[1]
                master_obj = item[4]

                master_token_obj, created = MasterToken.objects.get_or_create(
                    master=master_obj, user=self.userobj)

                if created:
                    master_token_obj.has_expired = False
                    master_token_obj.created_at = datetime.datetime.now()
                    master_token_obj.token = token
                    master_token_obj.allowed_functions = allowed_methods
                    master_token_obj.save()
            return True
        except:
            return False


class DeleteUsers(generics.GenericAPIView):

    """
        View to delete the users
    """

    def post(self, request):
        """
            Submit a POST request with user id to be deleted from the database.
            Parameters: {"h1": 1, "h2": 2}
            API: http://<hostname>/user/delete/
            Response Data: {"status": 200, "error": [], "data": {"results": {"deleted_users": [1,2]}}}
        """

        deleted_users = []

        self.user_obj = self.request.user

        user_id_list = request.DATA.values()

        try:
            user_id_list = [int(userid) for userid in user_id_list]
        except:
            logger.error("Invalid Users!")
            return Response(dict(
                error=["invalid_users"], data={}, status=status.HTTP_400_BAD_REQUEST))

        for userid in user_id_list:
            if not self.user_obj.id == userid:
                try:
                    del_user_obj = User.objects.get(pk=userid)
                except:
                    del_user_obj = None

                if del_user_obj and not del_user_obj.is_superuser:
                    Master.objects.filter(
                        created_by__id=userid).update(created_by=None)
                    Master.objects.filter(
                        modified_by__id=userid).update(modified_by=None)
                    del_user_obj.delete()
                    deleted_users.append(userid)

        return Response(dict(
            error=[], data=dict(results=dict(deleted_users=deleted_users)),
            status=status.HTTP_200_OK
        ))


class EditUserView(generics.ListCreateAPIView):

    """
        View to edit a user
    """

    def post(self, request, userid):
        """
            Edit User using post parameters
            Parameters:
                    {
                            "first_name":<first_name>,
                            "last_name":<last_name>,
                            "email":<email>,
                            "type":<type_of_user> #can be one of normal, admin, superuser
                    }
            API: http://<hostname>/users/<userid>/edit/
            Please make to add auth token in headers.
        """
        try:
            self.userobj = User.objects.get(id=int(userid))
        except:
            return Response(dict(error=["user_doesnot_exist"], data=dict(userid=int(userid)),
                                 status=status.HTTP_400_BAD_REQUEST))

        first_name = request.DATA.get("first_name", None)
        last_name = request.DATA.get("last_name", None)
        email = request.DATA.get("email", None)

        # Check for first name and last name must be alphanumeric
        if not first_name.isalnum():
            return Response(dict(error=['firstname_alphanumeric'],
                                 data=dict(first_name=first_name)),
                            status=status.HTTP_400_BAD_REQUEST)

        if not last_name.isalnum():
            return Response(dict(error=['lastname_alphanumeric'],
                                 data=dict(last_name=last_name)),
                            status=status.HTTP_400_BAD_REQUEST)

        authtokenutils = AuthTokenUtils()
        serializer = EditUserSerializer(data=request.DATA)
        if serializer.is_valid():
            User.objects.filter(id=int(userid)).update(**{
                "first_name": first_name,
                "last_name": last_name,
                "email": email,
            })
            self.update_user_profile(request.DATA.get("type"))
            return Response(dict(error=[], data={}, status=status.HTTP_200_OK))
        else:
            return Response(dict(error=serializer.errors, data={}, status=status.HTTP_400_BAD_REQUEST))

    def update_user_profile(self, user_type):
        """
            save the type of the user using the userobj provided
        """
        if self.userobj:
            if user_type == 'user':
                self.userobj.userprofile.is_user = True
                self.userobj.userprofile.is_superuser = False
                self.userobj.userprofile.is_admin = False
                self.userobj.userprofile.save()
            elif user_type == 'superuser':
                self.userobj.userprofile.is_superuser = True
                self.userobj.userprofile.is_user = False
                self.userobj.userprofile.is_admin = False
                self.userobj.userprofile.save()
            elif user_type == 'admin':
                self.userobj.userprofile.is_admin = True
                self.userobj.userprofile.is_superuser = False
                self.userobj.userprofile.is_user = False
                self.userobj.userprofile.save()


class UserObject(generics.ListAPIView):

    """
        Get User object and return the response
    """
    serializer_class = UserDetailSerializer

    def get_queryset(self):
        """
            get query set : retrieve a single user
        """
        user_id = self.kwargs['userid']
        return User.objects.filter(id=user_id)

    def list(self, request, *args, **kwargs):
        """
            send custom response overriding the list method
        """
        response = generics.ListAPIView.list(
            self, request, *args, **kwargs).data
        return Response(dict(data=response, error=[]), status=status.HTTP_200_OK)


class ObjectCountView(generics.ListAPIView):

    """
        View to send objects counts
    """

    def get_target_counts(self):
        """
            process response data to get target counts
        """
        target_count_list = list()
        target_obj_list = Target.objects.filter(created_by=self.request.user, is_quick_target=False)

        for target_obj in target_obj_list:
            target_minion_count = {}
            TargetMinions.objects.filter(target=target_obj).count()
            target_minion_count["target_name"] = target_obj.target_name
            target_minion_count["count"] = TargetMinions.objects.filter(target=target_obj).count()
            target_minion_count["id"] = target_obj.id

            try:
                fav_target_obj = UserFavorites.objects.get(user=self.request.user, target=target_obj)
            except:
                fav_target_obj = None

            if fav_target_obj:
                target_minion_count["is_user_favorite"] = True
            else:
                target_minion_count["is_user_favorite"] = False

            target_count_list.append(target_minion_count)
        return target_count_list

    def get_quick_target_counts(self):
        """
            process response data to get quick target counts
        """
        quick_target_obj = Target.objects.filter(
            created_by=self.request.user, is_quick_target=True)
        quick_target_count = TargetMinions.objects.filter(target=quick_target_obj).count()

        return quick_target_count

    def get_minion_status(self):
        """
            Get minion status
        """
        total_minions_obj = Minion.objects.all()
        total_minions = total_minions_obj.count()
        minions_up = total_minions_obj.filter(is_minion_up=True).count()

        return dict(total_minions=total_minions, minions_up=minions_up)

    def list(self, request, *args, **kwargs):
        """
            send custom response using overriding the list method
        """

        # Get target name and count
        target_count_dict = self.get_target_counts()

        # Get quick target name and count
        quick_target_count = self.get_quick_target_counts()

        # Create response data for quick target
        results = [dict(quick_target_count=quick_target_count)]

        minion_data = self.get_minion_status()

        # Create response data for target
        results.extend(target_count_dict)
        results.append(dict(minion_count=minion_data))

        response = dict(dict(results=results))

        # Return data
        return Response(dict(data=response, error=[]), status=status.HTTP_200_OK)


class CreateSystemFolderView(views.APIView):
    """
        View to create a folder at any level
    """

    def post(self, request):
        """
            Create a folder at any level
            URL: http://<hostname>/core/folder/create/
            Parameters:
            {
                "parent_id":"<parent_id>"
                "folder_name": "<folder_name>"
            }
            Method: POST
            Please make to add auth token in headers.
        """

        self.user_obj = request.user
        parent_id = request.DATA.get("parent_id", None)
        folder_name = request.DATA.get("folder_name", None).strip()

        try:
            self.parent = SystemFolder.objects.get(id=parent_id)
        except:
            self.parent = None

        if not folder_name:
            logger.error("Folder name empty!")
            return Response(dict(error=["folder_name_empty"], data=dict(folder_name=folder_name)),
                            status=status.HTTP_400_BAD_REQUEST)

        if not re.match('^[a-zA-Z0-9\.\- ]+$', folder_name):
            logger.error("Special characters not allowed in folder names except period and hyphen")
            return Response(dict(error=["special_characters_not_allowed"], data=dict(folder_name=folder_name)),
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            self.folder_obj = SystemFolder.objects.filter(name=folder_name, parent=self.parent)
        except:
            self.folder_obj = None

        if self.folder_obj:
            logger.error("Folder already exists!")
            return Response(dict(error=["folder_name_exists"], data=dict(folder_name=folder_name)),
                            status=status.HTTP_400_BAD_REQUEST)
        else:
            self.folder_obj = SystemFolder.objects.create(name=folder_name, parent=self.parent,
                                                          created_by=self.user_obj)
            logger.info("Folder successfully created!")
            return Response(dict(error=[], data=dict(folder_name=folder_name)),
                            status=status.HTTP_200_OK)


class DeleteSystemFolderView(generics.GenericAPIView):

    """
        View to delete system folders at a given level
    """

    def post(self, request, folder_id):
        """
            To delete system folder at any given level. If a folder is deleted, all the
            contents inside that folder will also be deleted including the targets.
            API: http://<hostname>/core/folder/delete/(?P<id>\d+)/
        """

        self.user_obj = self.request.user

        user_favorite_list = [obj.target.id for obj in UserFavorites.objects.all()]

        try:
            folder_obj = SystemFolder.objects.get(id=folder_id)
        except:
            logger.error("Folder with id %s doesnot exists" % folder_id)
            return Response(dict(error=["folder_doesnot_exists"], data=dict(),),
                            status=status.HTTP_400_BAD_REQUEST)
        if folder_obj:
            folder_obj.delete()
            target_objects = Target.objects.filter(system_folder=None).exclude(is_quick_target=True)

            # Delete all the targets present under nested structure
            for obj in target_objects:
                if obj.id not in user_favorite_list:
                    obj.delete()

        return Response(dict(error=[], data=dict()), status=status.HTTP_200_OK)


class EditSystemFolderView(generics.ListCreateAPIView):
    """
        View to edit a folder at any level
    """
    def post(self, request):
        """
            Create a folder at any level
            URL: http://<hostname>/core/folder/edit/
            Method: POST
            Parameters:
            {
                "folder_id":"<folder_id>",
                "folder_old_name": "<folder_old_name>",
                "folder_new_name": "<folder_new_name>"
            }
            Please make to add auth token in headers.
        """
        self.user_obj = self.request.user
        folder_id = request.DATA.get("folder_id", None)
        folder_old_name = request.DATA.get("folder_old_name", None)
        folder_new_name = request.DATA.get("folder_new_name", None)

        if not folder_new_name:
            logger.error("Folder name empty!")
            return Response(dict(error=["folder_name_empty"], data=dict(folder_name=folder_new_name)),
                            status=status.HTTP_400_BAD_REQUEST)

        if not re.match('^[a-zA-Z0-9\.\- ]+$', folder_new_name):
            logger.error("Special characters not allowed in folder names except period and hyphen")
            return Response(dict(error=["special_characters_not_allowed"], data=dict(folder_new_name=folder_new_name)),
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            self.current_folder = SystemFolder.objects.get(id=folder_id)
        except ObjectDoesNotExist:
            logger.error("Folder does not exists!")
            return Response(dict(error=["folder_name_does_not_exists"], data=dict(folder_name=folder_old_name)),
                            status=status.HTTP_400_BAD_REQUEST)

        if not self.current_folder.parent:
            logger.error("Invalid parent")
            return Response(dict(error=["invalid_parent"], data=dict(folder_name=folder_old_name)),
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            self.new_folder = SystemFolder.objects.get(name=folder_new_name, parent=self.current_folder.parent)
        except ObjectDoesNotExist:
            self.new_folder = None

        if self.new_folder and self.new_folder != self.current_folder:
            logger.error("Folder already exists!")
            return Response(dict(error=["folder_name_exists"], data=dict(folder_name=folder_new_name)),
                            status=status.HTTP_400_BAD_REQUEST)

        if self.current_folder.created_by != self.user_obj:
            logger.error("User not allowed to edit folder")
            return Response(dict(error=["user_not_allowed_to_edit_folder"],
                                 data=dict(folder_name=folder_old_name)),
                            status=status.HTTP_400_BAD_REQUEST)

        self.current_folder.name = folder_new_name
        self.current_folder.save()
        logger.info("Folder successfully edited!")
        return Response(dict(error=[], data=dict(folder_name=folder_new_name)),
                        status=status.HTTP_200_OK)


class PublicSystemFolderView(generics.ListAPIView):
    """
        View to send public system folder hierarchy structure
        URL: http://<hostname>/core/public/folder/all/
        Method : GET
        Please make to add auth token in headers.
    """

    def get_tree_structure_json(self):
        """
            Trivial iteration per row query is going to slow down the database. To
            avoid this, we should cache the children on each node so that those queries
            can be done all at once. django-mptt has a cache_tree_children() function we
            can do this with.
        """

        # Get all system folders
        root_nodes = cache_tree_children(SystemFolder.objects.all())

        tree_structure = []

        for root_node in root_nodes:
            if root_node.name == "Public":
                tree_structure.append(self.recursive_node_to_dict(root_node))
                if root_node.name == "Private":
                    break;

        return tree_structure

    def recursive_node_to_dict(self, node):
        """
            Function called recursively to find the children till a leaf node is encountered.
        """

        result = dict(id=node.pk, name=node.name)
        if node.parent == None:
            result.update(is_root=True)
        folder_id = result.get("id")
        try:
            sys_folder_obj = SystemFolder.objects.get(id=folder_id)
        except:
            sys_folder_obj = None

        if sys_folder_obj:
            target_obj_list = sys_folder_obj.target_set.all()
            target_list = []
            for target_obj in target_obj_list:
                minion_count = TargetMinions.objects.filter(target=target_obj).count()
                info = dict(minion_count=minion_count, target_name=target_obj.target_name, id=target_obj.id)
                target_list.append(info)
            result.update(target=target_list)

        children = [self.recursive_node_to_dict(c) for c in node.get_children()]

        if children:
            result['children'] = children

        return result

    def list(self, request, *args, **kwargs):
        """
            send custom response using overriding the list method
        """

        data = self.get_tree_structure_json()

        return Response(dict(results=data, error=[]), status=status.HTTP_200_OK)


class PrivateSystemFolderView(generics.ListAPIView):
    """
        View to send system private folder hierarchy structure
        URL: http://<hostname>/core/private/folder/all/
        Method : GET
        Please make to add auth token in headers.
    """

    def get_tree_structure_json(self):
        """
            Trivial iteration per row query is going to slow down the database. To
            avoid this, we should cache the children on each node so that those queries
            can be done all at once. django-mptt has a cache_tree_children() function we
            can do this with.
        """

        # Get all system folders
        root_nodes = cache_tree_children(SystemFolder.objects.all())

        tree_structure = []

        for root_node in root_nodes:
            if root_node.name == "Private":
                tree_structure.append(self.recursive_node_to_dict(root_node))
                if root_node.name == "Public":
                    break;

        return tree_structure

    def recursive_node_to_dict(self, node):
        """
            Function called recursively to find the children till a leaf node is encountered.
        """

        result = dict(id=node.pk, name=node.name)
        if node.parent == None:
            result.update(is_root=True)
        folder_id = result.get("id")
        try:
            sys_folder_obj = SystemFolder.objects.get(id=folder_id)
        except:
            sys_folder_obj = None

        if sys_folder_obj:
            target_obj_list = sys_folder_obj.target_set.filter(created_by=self.request.user)
            target_list = []
            for target_obj in target_obj_list:
                minion_count = TargetMinions.objects.filter(target=target_obj).count()
                info = dict(minion_count=minion_count, target_name=target_obj.target_name, id=target_obj.id)
                target_list.append(info)
            result.update(target=target_list)

        children = [self.recursive_node_to_dict(c) for c in node.get_children().
                    filter(created_by=self.request.user)]

        if children:
            result['children'] = children

        return result

    def list(self, request, *args, **kwargs):
        """
            send custom response using overriding the list method
        """

        data = self.get_tree_structure_json()

        return Response(dict(results=data, error=[]), status=status.HTTP_200_OK)


class MinionKeyAction(views.APIView):
    """
        View to handle key management for minions
    """
    def post(self, request):
        """
            URL: http://localhost/key/action/
            Method: POST
            Parameters:
                        {
                        "fun": "key.accept",
                        "client": "wheel",
                        "match": "minion",
                        "token": "<master token>"
                        }
        """
        action = request.DATA.get("action")

        # check for action specified
        if not action:
            return Response(dict(error=["no_action_specified"], data=dict()),
                            status=status.HTTP_400_BAD_REQUEST)

        # change action to lower case just in case
        action = action.lower()

        # check for action available
        if action not in settings.KEY_ACTION:
            return Response(dict(error=["action_doesnot_exists"], data=dict()),
                            status=status.HTTP_400_BAD_REQUEST)

        minion_id_list = request.DATA.get("minions")

        # Get a list of minion objects for the provided ID
        try:
            minion_obj_list = Minion.objects.filter(id__in=minion_id_list)
        except:
            minion_obj_list = []

        # If no minions exists for provided id, return 400
        if not minion_obj_list:
            return Response(dict(error=["minion_doesnot_exists"], data=dict()),
                            status=status.HTTP_400_BAD_REQUEST)

        ret_val = dict()
        for minion in minion_obj_list:

            # get master obj associated with the minion
            try:
                master_obj = Master.objects.get(id=minion.master.id)
            except:
                return Response(dict(error=["invalid_master_id"], data={}),
                                status=status.HTTP_400_BAD_REQUEST)

            # instantiate SaltKeyUtils to do key operations
            salt_key_utils = SaltKeyUtils(master_obj.id)
            key_status = salt_key_utils.key_action(action, minion.minion_id)

            # create return data for
            if master_obj.hostname in ret_val:
                ret_val[master_obj.hostname].update({minion.minion_id: key_status})
            else:
                ret_val[master_obj.hostname] = {minion.minion_id: key_status}

        return Response(dict(error=[], data=ret_val), status=status.HTTP_200_OK)


class GrainsListView(generics.ListAPIView):
    """
        View to list grain values
    """
    def get_queryset(self):

        cursor = connection.cursor()
        cursor.execute('select distinct (jsonb_each_text(config)).* from minion_minion;')
        result = cursor.fetchall()

        grain_values = {}
        # populate the dictionary with grain and list of corresponding grain values
        for grain in result:
            if grain[0] not in grain_values:
                grain_values[grain[0]] = []
            grain_values[grain[0]].append(grain[1])
        return grain_values

    def list(self, request, *args, **kwargs):
        """
            send custom response using overriding the list method
        """
        grain_values = self.get_queryset()
        return Response(dict(data=grain_values, error=[]), status=status.HTTP_200_OK)


class BeaconsListView(generics.ListAPIView):
    """
        View to list all beacons
        URL: http://localhost/core/beacons/all/
        Method: GET
    """

    serializer_class = BeaconSerializer

    def get_queryset(self):

        return Beacon.objects.all()

    def list(self, request, *args, **kwargs):
        """
            send custom response using overriding the list method
        """

        response = generics.ListAPIView.list(
            self, request, *args, **kwargs).data

        return Response(dict(data=response, error=[]), status=status.HTTP_200_OK)


class ListBeaconActiveTargets(generics.ListAPIView):
    """
        Method to list down all the targets on which
        the selected beacon is active
        URL: http://<hostname>/core/beacons/<beacon_id>/activetargets/
        MEthod: GET
    """

    serializer_class = TargetListSerializer

    def get_queryset(self):
        beacon_id = self.kwargs['beacon_id']
        minions = list(chain(*MinionBeacon.objects.filter(beacon=beacon_id).values_list('minion')))
        targets = list(chain(*TargetMinions.objects.filter(minion__id__in=minions).values_list('target')))
        return Target.objects.filter(id__in=targets)

    def list(self, request, *args, **kwargs):
        """
            send custom response overriding the list method
        """
        response = generics.ListAPIView.list(self, request, *args, **kwargs).data
        return Response(dict(data=response, error=[]), status=status.HTTP_200_OK)


class UploadBeaconScript(views.APIView):
    """
        View to upload beacon files.
        URL: http://hostname/core/upload/beacon/script/
        Method: POST
        Parameters: name, description, filename
    """

    def post(self, request):
        """
            Get the beacon file from request parameter and write the file on the server
        """

        # Get user object from request
        self.userobj = request.user

        # Get name for the state file
        name = request.DATA.get("name", "").strip()

        if not name:
            return Response(dict(error=["name_empty"], data=dict()), status=status.HTTP_400_BAD_REQUEST)

        # Get file object from file parameter
        self.script_file_obj = request.FILES.get("script")
        if not self.script_file_obj:
            return Response(dict(error=["script_file_empty"], data=dict()), status=status.HTTP_400_BAD_REQUEST)

        # Get description
        description = request.DATA.get("description", "").strip()
        if not description:
            return Response(dict(error=["description_empty"], data=dict()), status=status.HTTP_400_BAD_REQUEST)

        # Write file on the server
        ret_status, filename, file_path = self._write_file()

        if not ret_status:
            return Response(dict(error=["error_uploading_file"], data=dict()),
                            status=status.HTTP_400_BAD_REQUEST)

        # Write file on the server
        validation_status = self._validate_script(file_path)

        if not validation_status:
            return Response(dict(error=["invalid_script"], data=dict()),
                            status=status.HTTP_400_BAD_REQUEST)

        params_dict = dict(name=name, description=description, file_path=file_path,
                           created_by=self.userobj.id)

        serializer = BeaconUploadSerializer(data=params_dict)

        if serializer.is_valid():
            serializer.save()
        else:
            # Error processing
            error_list = [
                e for error in serializer.errors.values() for e in error]
            return Response(dict(error=error_list, data={}), status=status.HTTP_400_BAD_REQUEST)

        return Response(dict(error=[], data=dict()), status=status.HTTP_200_OK)

    def _write_file(self):
        """
            To write the file on the server. Creates a temporary directory under project directory and
            writes each chunk of in memory file object on the server's disk. Returns status message on
            the basis of the operation.
        """

        try:
            # Get the filename
            filename = self.script_file_obj.name

            # Use datetime stamp to create the folder
            datetime_stamp = datetime.datetime.now().strftime('%Y%m%d%H%M%S')

            # Folder path to have randon datetime as location
            folder_path = os.path.join(settings.BEACON_SCRIPT_LOCATION, datetime_stamp)

            # If folder doesn't exists, create new folder and assign permission
            if not os.path.exists(folder_path):
                os.makedirs(folder_path)

            # Create filepath
            file_path = os.path.join(folder_path, filename)

            # Write the file to the required location
            with open(file_path, 'wb+') as in_memory_file:
                for chunk in self.script_file_obj.chunks():
                    in_memory_file.write(chunk)
        except:
            return False, "", ""

        return True, filename, file_path

    def _validate_script(self, file_path):
        """
            To validate the uploaded python beacon script
        """
        try:
            py_compile.compile(file_path, doraise=True)
        except:
            return False
        return True


class TargetBeaconsStatsView(generics.GenericAPIView):
    """
        Retrieve counts of beacons for specific duration.
        Method: GET
        URL: http://hostname/core/beacons/stats?type=<beacon_type>
            &hours=<cutoff_hours>&difference=<hours_difference>
            &target=<target_id>&type=<beacon_type>
        Please make sure auth token is added in the header
    """
    def check_cutoff(self, event_time, start_time, hours, difference):
        """
            check cutoff for event timestamp
        """
        end_time = start_time - datetime.timedelta(hours=hours)
        if end_time <= event_time <= start_time:
            time_diff = start_time - event_time
            return divmod(time_diff.days * 86400 + time_diff.seconds, 3600 * difference)
        else:
            return False

    def get(self, request, *args, **kwargs):
        """
            send target beacon counts for selected target
        """
        beacon_type = request.GET.get("type")

        try:
            difference = int(request.GET.get("difference", 1))
        except:
            return Response(dict(error=["difference_must_be_integer"], data=dict()),
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            hours = int(request.GET.get("hours", 10))
        except:
            return Response(dict(error=["hours_must_be_integer"], data=dict()),
                            status=status.HTTP_400_BAD_REQUEST)

        target_id = request.GET.get("target_id")
        try:
            target_obj = Target.objects.filter(id=target_id)
        except:
            return Response(dict(error=["target_not_available"], data=dict()),
                            status=status.HTTP_400_BAD_REQUEST)

        # set default values to range
        response = defaultdict(int)
        for i in range(int(hours/difference)):
            response[i+1] = 0

        # get all wtmp events
        events = salt_events.objects.filter(tag__iregex=r'salt/beacon/(.*)/wtmp/')

        if events:
            # Check target if target then get all minions from that target
            if target_id:
                minions = TargetMinions.objects.filter(target=target_obj).values_list('minion__minion_id', flat=True)
            else:
                minions = []

            start_time = datetime.datetime.now()
            for event in events:
                data = event.data
                minion = data.get('data').get('id')

                # check minion is in target minions if target available
                if minion in minions or not target_id:
                    # convert stamp into date time object
                    event_time = datetime.datetime.strptime(data.get('_stamp'), '%Y-%m-%dT%H:%M:%S.%f')

                    # check for event time cutoff
                    cutoff = self.check_cutoff(event_time, start_time, hours, difference)
                    if cutoff:
                        response[cutoff[0]+1] = response[cutoff[0]+1] + 1

        return Response(dict(data=response, error=[]), status=status.HTTP_200_OK)


class TargetBeaconsListView(generics.GenericAPIView):
    """
        Retrieve list of beacons for specific duration.
        Method: GET
        URL: http://hostname/Core/beacons/stats?type=<beacon_type>
            &hours=<cutoff_hours>&target=<target_id>
        Please make sure auth token is added in the header
    """
    def check_cutoff(self, event_time, start_time, hours, difference):
        """
            check cutoff for event timestamp
        """
        end_time = start_time - datetime.timedelta(hours=hours)
        if end_time <= event_time <= start_time:
            time_diff = start_time - event_time
            return divmod(time_diff.days * 86400 + time_diff.seconds, 3600 * difference)
        else:
            return False

    def get(self, request, *args, **kwargs):
        """
            send target beacon list
        """
        beacon_type = request.GET.get("type")

        try:
            difference = int(request.GET.get("difference", 1))
        except:
            return Response(dict(error=["difference_must_be_integer"], data=dict()),
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            hours = int(request.GET.get("hours", 10))
        except:
            return Response(dict(error=["hours_must_be_integer"], data=dict()),
                            status=status.HTTP_400_BAD_REQUEST)

        target_id = request.GET.get("target_id")
        try:
            target_obj = Target.objects.filter(id=target_id)
        except:
            return Response(dict(error=["target_not_available"], data=dict()),
                            status=status.HTTP_400_BAD_REQUEST)

        # set default values to response
        response = []

        # get all wtmp events
        events = salt_events.objects.filter(tag__iregex=r'salt/beacon/(.*)/wtmp/')

        if events:
            # Check target if target then get all minions from that target
            if target_id:
                minions = TargetMinions.objects.filter(target=target_obj).values_list('minion__minion_id', flat=True)
            else:
                minions = []

            start_time = datetime.datetime.now()

            for event in events:
                data = event.data
                minion = data.get('data').get('id')

                # check minion is in target minions if target available
                if minion in minions or not target_id:
                    # convert stamp into date time object
                    event_time = datetime.datetime.strptime(data.get('_stamp'), '%Y-%m-%dT%H:%M:%S.%f')

                    # check for event time cutoff
                    cutoff = self.check_cutoff(event_time, start_time, hours, difference)
                    if cutoff:
                        response.append(data)

        return Response(dict(data=response, error=[]), status=status.HTTP_200_OK)


class TargetBeaconsEventListView(generics.GenericAPIView):
    """
        Retrieve list of beacon events for all activated beacons for selected target
        Method: GET
        URL: http://hostname/core/beacons/events/?target=<target_id>
    """

    def get(self, request, *args, **kwargs):
        """
            retrieve event data
        """
        # get target id from GET parameter
        target_id = request.GET.get("target_id")

        # get target object from the database
        try:
            target_obj = Target.objects.get(id=target_id)
        except:
            return Response(dict(error=["invalid_target"], data=dict()),
                            status=status.HTTP_400_BAD_REQUEST)

        # get a list of minions for a selected target
        minions_id_list = [obj.minion.minion_id for obj in target_obj.targetminions_set.all()]

        # get all the events related to beacons
        events = salt_events.objects.filter(
                                            tag__iregex=r"salt/beacon/(.*)/(.*)/"
                                            ).order_by("-id")

        event_list = []

        # iterate over each beacon event and check if that beacon is for selected target minion
        for event_obj in events:
            # load event data json, try except just in case dict parsing fails
            try:
                event_data = event_obj.data
            except:
                event_data = dict()

            if event_data:
                # check minion existence
                try:
                    minion_id = event_data.get("data").get("id")
                except:
                    minion_id = None

                # create a list of events for selected target minions
                if minion_id in minions_id_list:
                    # sample tag structure - salt/beacon/shwetabhs-minion1/wtmp/
                    tag = event_obj.tag

                    # getting name of the beacon from the tag - salt/beacon/shwetabhs-minion1/wtmp/
                    try:
                        name = tag.split(os.sep)[-2]
                    except:
                        name = None

                    event_list.append(dict(tag=tag, event_data=event_data, name=name))

        # create DS for storing beacon event per beacon
        beacon_dict = dict()
        for beacon in Beacon.objects.all():
            beacon_dict[beacon.name] = list()

        # create event data dict per beacon
        for event in event_list:
            name = event.get("name")
            if name in beacon_dict:
                beacon_dict[name].append(event)

        # return data dict
        return Response(dict(data=beacon_dict, error=[]), status=status.HTTP_200_OK)


class DeleteBeacons(generics.GenericAPIView):
    """
        View to delete beacons
    """
    def post(self, request):
        """
            REST API to delete beacons
            Parameters: {"b1": <beacon_id>, "b2":<beacon_id>, "b3": <beacon_id>}
            URL: http://localhost/core/beacon/delete/
        """
        self.user_obj = self.request.user

        beacons = request.DATA.values()

        deleted_beacons = list()

        for beacon in beacons:
            try:
                beacon_obj = Beacon.objects.get(id=beacon, created_by=self.user_obj)
            except:
                beacon_obj = None
            if beacon_obj:
                deleted_beacons.append(beacon_obj.name)
                beacon_obj.delete()
        return Response(dict(error=[], data=dict(results=dict(deleted_beacons=deleted_beacons)),
                             status=status.HTTP_200_OK))


class FolderMinionListing(generics.ListAPIView):
    """
        View to list minions belonging to targets at a particular folder structure level
        Example:
        Public
        |
        ---A
        |  |___centos minions
        |  |___redhat minions
        |
        ---B
        |  |___ubuntu minions
        |
        Private

        Use Case 1: if we are at level "Public" it will list all the minions
        belonging to targets under level under "Public"

        Use Case 2: if we are at level "A" it will list all the minions
        belonging to the targets under level "A"

        URL: http://<localhost>/core/folder/<folderid>/minion/list/
        Method: GET
        Please make sure auth token is added in the header
    """
    serializer_class = MinionSerializer
    filter_backends = (filters.OrderingFilter,)
    ordering_fields = ("hostname", "minion_id", "is_minion_up", "master")
    paginate_by = 100

    def get_queryset(self):

        """
            Function called recursively to find all the minions under a folder level
        """

        target_list = list()
        target_minion_list = list()
        minion_list = None

        # get all descendants for the folder object select by the user
        folder_obj_list = self.folder_obj.get_descendants()

        # get targets under that folder
        [target_list.extend(folder.target_set.all()) for folder in folder_obj_list]

        # add targets under the user selected folder
        target_list.extend(self.folder_obj.target_set.all())

        if self.folder_obj.is_root_node() and self.folder_obj.name == 'Private':
            target_list = [tgt for tgt in target_list if tgt.created_by == self.request.user]
        # get TargetMinion instances for the targets
        [target_minion_list.extend(target.targetminions_set.all()) for target in target_list]

        # get minions from the target minions
        minion_list = [tgt_mn.minion for tgt_mn in target_minion_list]

        # remove duplicate minion entries in the list
        minion_list = list(set(minion_list))

        return minion_list

    def list(self, request, *args, **kwargs):
        """
            send custom response using overriding the list method
        """

        folder_id = self.kwargs['folderid']

        try:
            self.folder_obj = SystemFolder.objects.get(id=folder_id)
        except:
            return Response(dict(error=["invalid_folder_id"], data=dict()),
                            status=status.HTTP_400_BAD_REQUEST)

        response = generics.ListAPIView.list(
            self, request, *args, **kwargs).data
        # variable to retrieve pagination number
        minion_paginator = self.paginate_queryset(self.object_list)
        # set next and previous page numbers
        try:
            response.update({"next_page_number": minion_paginator.next_page_number()})
        except:
            response.update({"next_page_number": None})
        try:
            response.update({"previous_page_number": minion_paginator.previous_page_number()})
        except:
            response.update({"previous_page_number": None})
        try:
            response.update({"total_page_number": minion_paginator.paginator._get_num_pages()})
        except:
            response.update({"total_page_number": None})
        return Response(dict(data=response, error=[]), status=status.HTTP_200_OK)
