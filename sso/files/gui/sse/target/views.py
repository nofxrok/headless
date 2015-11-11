"""
    Views for handling Target App APIs
"""

from .models import Target, TargetMinions, UserFavorites
from .serializers import (TargetListSerializer, TargetMinionsSerializer,
                          TargetBeaconsSerializer)
from core.models import SystemFolder
from minion.models import (Minion, MinionBeacon)
from minion.serializers import MinionSerializer
from rest_framework import generics, filters
from rest_framework import status
from rest_framework.response import Response
from itertools import chain
import datetime
import logging
import re

# logger settings
logger = logging.getLogger("sse.target")


class CreateQuickTargetView(generics.ListCreateAPIView):

    """
        View to create quick target. Quick target is user specific.
    """

    def post(self, request):
        """
            POST view to create a quick target. QuickTarget will be user specific.
            Only one quick target is allowed per user.
            Parameters:
                    {
                            "m1":id,
                            "m2":id,
                            "m3":id,
                            "m4":id,
                            "m5":id
                    }
            API: http://<hostname>/target/qt/add/
            Please make to add auth token in headers.
        """

        self.userobj = request.user

        minion_id_list = request.DATA.values()

        # Get a list of minion objects for the provided ID
        try:
            minion_obj_list = Minion.objects.filter(id__in=minion_id_list)
        except:
            minion_obj_list = []

        # If no minions exists for provided id, return 400
        if not minion_obj_list:
            return Response(dict(error=["minion_doesnot_exists"], data=dict()),
                            status=status.HTTP_400_BAD_REQUEST)

        # Create or update quick target
        quick_target_obj, created = Target.objects.get_or_create(is_quick_target=True,
                                                                 created_by=self.userobj)

        # Update created/modified datetime and user
        if created:
            quick_target_obj.created_at = datetime.datetime.now()
            quick_target_obj.save()
        else:
            quick_target_obj.modified_by = self.userobj
            quick_target_obj.modified_at = datetime.datetime.now()
            quick_target_obj.save()

        # Create/update target minions
        [TargetMinions.objects.get_or_create(target=quick_target_obj, minion=minion_obj)
         for minion_obj in minion_obj_list]

        target_minions = TargetMinions.objects.filter(
            target=quick_target_obj).count()

        return Response(dict(error=[], data=dict(total_minion=target_minions)), status=status.HTTP_200_OK)


class ListQuickTargetView(generics.ListAPIView):
    """
        Get quick target object list and return the response
    """
    serializer_class = TargetMinionsSerializer
    filter_backends = (filters.OrderingFilter,)
    ordering_fields = ("minion__hostname", "minion__minion_id",
                       "minion__is_minion_up", "minion__master")
    paginate_by = 100

    def get_queryset(self):
        """
            get query set
        """
        try:
            self.target_obj = Target.objects.get(
                created_by=self.request.user, is_quick_target=True)
        except:
            self.target_obj = None

        return TargetMinions.objects.filter(target=self.target_obj)

    def list(self, request, *args, **kwargs):
        """
            send custom response using overriding the list method
        """
        response = generics.ListAPIView.list(
            self, request, *args, **kwargs).data
        # variable to retrieve pagination number
        minion_paginator = self.paginate_queryset(self.object_list)
        # set next and previous page numbers
        if self.target_obj:
            response.update({"tgt_id":self.target_obj.id})
        else:
            response.update({"tgt_id": None})
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


class DeleteQuickTargetView(generics.DestroyAPIView):

    """
        View to delete the Quick Targets.
    """

    def delete(self, request):
        """
            Delete view to delete Quick Target
            API: http://<hostname>/qt/delete/
            Please make sure auth token is added in the header
        """

        Target.objects.filter(is_quick_target=True,
                              created_by=self.request.user).delete()

        return Response(dict(error=[], data=dict(), status=status.HTTP_200_OK))


class DeleteQuickTargetMinionView(generics.DestroyAPIView):

    """
        Delete a single minion from current users quick target.
    """

    def delete(self, request, minion_id):
        """
            DELETE view to delete a single minion from current users quick target.
            API: http://<hostname>/qt/<minion-id>/delete/$
            Please make sure auth token is added in the header
        """
        try:
            target_minions_obj = TargetMinions.objects.get(
                minion=minion_id, target__created_by=self.request.user, target__is_quick_target=True)
        except:
            return Response(dict(error=["minion_doesnot_exists"], data={}),
                            status=status.HTTP_400_BAD_REQUEST)

        target_minions_obj.delete()

        return Response(dict(error=[], data=dict(), status=status.HTTP_200_OK))


class DeleteQuickTargetMinionsView(generics.GenericAPIView):

    """
        Delete a list of minions from current users quick target.
    """

    def post(self, request):
        """
            DELETE view to delete a list of minion from current users quick target.
            API: http://<hostname>/qt/minions/delete/$
            METHOD: POST
            Parameters: ['m1', 'm2', 'm3', 'm4', 'm5']
            Please make sure auth token is added in the header
        """
        deleted_minions = []

        minion_id_list = request.DATA.values()

        try:
            minion_id_list = [int(minion_id) for minion_id in minion_id_list]
        except:
            logger.error("Invalid Minions!")
            return Response(dict(
                error=["invalid_minions"], data={},
                status=status.HTTP_400_BAD_REQUEST))

        for minion_id in minion_id_list:
            try:
                TargetMinions.objects.get(minion=minion_id,
                                          target__created_by=self.request.user,
                                          target__is_quick_target=True).delete()
                deleted_minions.append(minion_id)
            except:
                pass

        return Response(dict(
            error=[], data=dict(results=dict(deleted_minions=deleted_minions)),
            status=status.HTTP_200_OK
        ))


class CreateTarget(generics.ListCreateAPIView):

    """
        Save a Quick Target. Upon saving a Quick Target a Target is created
        A target can have multiple minions
    """

    def post(self, request):
        """
            POST view to save a Quick Target as a Target. Targets will be user specific
            Parameters:
                {
                    "target_name": "<target_name>",
                    “is_user_favorite”: <boolean_value>,
                    "parent_id", "<parent_id>"
                }
            API: http://<hostname>/target/add/
            Please make sure auth token is added in the header
        """

        self.userobj = request.user

        target_name = request.DATA.get("target_name", None)
        is_user_favorite = request.DATA.get("is_user_favorite", False)
        parent_id = request.DATA.get("parent_id")

        if not target_name:
            return Response(dict(error=["target_name_empty"], data=dict()), status=status.HTTP_400_BAD_REQUEST)

        # check if input params are specified
        if target_name and not re.match('^[a-zA-Z0-9\.\- ]+$', target_name):
            logger.error("Special characters not allowed in target name")
            return Response(dict(error=["special_char_not_allowed"], data=dict(target_name=target_name)),
                            status=status.HTTP_400_BAD_REQUEST)

        quick_target_obj = Target.objects.filter(is_quick_target=True, created_by=self.userobj)

        if not quick_target_obj:
            return Response(dict(error=["quick_target_doesnot_exists"], data=dict()),
                            status=status.HTTP_400_BAD_REQUEST)

        # check if parent id sent is valid, if not valid return an error
        if not is_user_favorite and parent_id:
            try:
                parent_obj = SystemFolder.objects.get(id=parent_id)
            except:
                return Response(dict(error=["invalid_parent"], data=dict()),
                                status=status.HTTP_400_BAD_REQUEST)

        # check if parent id is being, if not sent return an error
        if not is_user_favorite and not parent_id:
            return Response(dict(error=["parent_not_selected"], data=dict()),
                            status=status.HTTP_400_BAD_REQUEST)

        # check if target exists at the same level
        target_obj = Target.objects.filter(created_by=self.userobj, target_name=target_name,
                                           system_folder=parent_id).first()
        # if yes, raise an error
        if target_obj:
            return Response(dict(error=["target_exists_at_same_level"], data=dict()),
                            status=status.HTTP_400_BAD_REQUEST)

        # retrieve list of minions for the quick target which is to be saved
        minion_list = [obj.minion for obj in TargetMinions.objects.filter(target=quick_target_obj)]

        if not minion_list:
            return Response(dict(error=["minion_doesnot_exists"], data=dict()),
                            status=status.HTTP_400_BAD_REQUEST)

        # Create parameters and try to validate against the serializers
        params = dict(target_name=target_name, created_by=self.userobj.id, created_at=datetime.datetime.now(),
                      system_folder=parent_id)
        serializer = TargetListSerializer(data=params)

        if not serializer.is_valid():
            # Process custom serializers error messages
            error_list = [
                e for error in serializer.errors.values() for e in error]
            return Response(dict(error=error_list, data={}), status=status.HTTP_400_BAD_REQUEST)

        serializer.save()

        target_minion_list = [TargetMinions.objects.create(target=serializer.object, minion=minion_obj)
                              for minion_obj in minion_list]

        try:
            if self.userobj and is_user_favorite:
                user_fav_obj = UserFavorites.objects.create(user=self.userobj, target=serializer.object)
        except:
            return Response(dict(error=["fav_already_exists"], data=dict()),
                            status=status.HTTP_400_BAD_REQUEST)

        return Response(dict(error=[], data=dict(target_name=target_name, minion_count=len(target_minion_list))),
                        status=status.HTTP_200_OK)


class ListTargetView(generics.ListAPIView):

    """
        Retrieve List of User specific targets
        Method : GET
        URL: http://hostname/target/all/
        Please make sure auth token is added in the header
    """
    serializer_class = TargetListSerializer
    paginate_by = 100

    def get_queryset(self):
        """
            get query set for targets
        """
        targets = Target.objects.filter(
            created_by=self.request.user, is_quick_target=False)
        return targets

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


class ListTargetMinionsView(generics.ListAPIView):
    """
        Retrieve List of Minions associated with a Target for a specific user
        Method: GET
        URL: http://hostname/target/<target_id>/minions/
        Please make sure auth token is added in the header
    """
    serializer_class = TargetMinionsSerializer
    filter_backends = (filters.OrderingFilter,)
    ordering_fields = ("minion__hostname", "minion__minion_id",
                       "minion__is_minion_up", "minion__master")
    paginate_by = 100

    def get_queryset(self):
        """
            get queryset for minions for a particular target
        """
        self.target_id = int(self.kwargs['target_id'])
        return TargetMinions.objects.filter(target__id=self.target_id)

    def list(self, request, *args, **kwargs):
        """
            send custom response overriding the list method
        """
        response = generics.ListAPIView.list(
            self, request, *args, **kwargs).data
        response.update({'target': {'id': self.target_id}})
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


class DeleteTargetView(generics.DestroyAPIView):
    """
        View to delete a Target
        URL: http://hostname/target/<target_id>/delete/
        Method: DELETE
    """

    def delete(self, request, target_id):
        """
            DELETE view to delete Quick Target
        """
        self.userobj = self.request.user
        # check if the incoming target id exists
        try:
            target_obj = Target.objects.get(id=target_id, created_by=self.userobj,
                                            is_quick_target=False)
        except:
            return Response(dict(error=["target_created_by_another_user"], data=dict()),
                            status=status.HTTP_400_BAD_REQUEST)
        # delete the target object
        target_obj.delete()
        return Response(dict(error=[], data=dict(), status=status.HTTP_200_OK))


class DeleteTargetMinionsView(generics.GenericAPIView):
    """
        View to delete list of minions from Target
        URL: http://hostname/target/<target_id>/minions/delete/
        Method: POST
        Parameters: ['m1', 'm2', 'm3', 'm4', 'm5']
        Please make sure auth token is added in the header
    """

    def post(self, request, target_id):
        """
            DELETE view to delete list of minions from Target
        """
        deleted_minions = []

        minion_id_list = request.DATA.values()

        try:
            minion_id_list = [int(minion_id) for minion_id in minion_id_list]
        except:
            logger.error("Invalid Minions!")
            return Response(dict(
                error=["invalid_minions"], data={},
                status=status.HTTP_400_BAD_REQUEST))

        for minion_id in minion_id_list:
            try:
                TargetMinions.objects.get(minion=minion_id,
                                          target__created_by=self.request.user,
                                          target__id=target_id,
                                          target__is_quick_target=False).delete()
                deleted_minions.append(minion_id)
            except:
                logger.error("Unauthorized access for minion id {0}".format(minion_id))

        return Response(dict(
            error=[], data=dict(results=dict(deleted_minions=deleted_minions)),
            status=status.HTTP_200_OK
        ))


class EditTargetView(generics.ListCreateAPIView):
    """
        View to edit a target name
    """
    def post(self, request, target_id):
        """
            URL: http://hostname/target/<target_id>/edit/
            Method: POST
            Parameters:
            {
                "old_target_name": "<old_target_name>",
                "new_target_name": "<new_target_name>"
            }
            Please make to add auth token in headers.
        """
        self.user_obj = self.request.user
        old_target_name = request.DATA.get("old_target_name", None)
        new_target_name = request.DATA.get("new_target_name", None)

        # check if input params are specified
        if not new_target_name:
            logger.error("New Target Name empty!")
            return Response(dict(error=["new_folder_name_empty"], data=dict(target_name=new_target_name)),
                            status=status.HTTP_400_BAD_REQUEST)

        # check if input params are specified
        if new_target_name and not re.match('^[a-zA-Z0-9\.\- ]+$', new_target_name):
            logger.error("Special characters not allowed in target name")
            return Response(dict(error=["special_char_not_allowed"], data=dict(target_name=new_target_name)),
                            status=status.HTTP_400_BAD_REQUEST)

        if not old_target_name:
            logger.error("Old Target Name empty!")
            return Response(dict(error=["old_folder_name_empty"], data=dict(target_name=old_target_name)),
                            status=status.HTTP_400_BAD_REQUEST)

        # get the parent for the target to be edited
        try:
            self.parent = Target.objects.get(id=target_id).system_folder
        except:
            self.parent = None

        # raise an error if invalid target id is provided
        if not self.parent:
            logger.error("Invalid Target ID provided!")
            return Response(dict(error=["invalid_target_id"], data=dict(target_name=old_target_name)),
                            status=status.HTTP_400_BAD_REQUEST)

        # check if target name exists at same level
        try:
            self.target_obj = Target.objects.filter(target_name=new_target_name, system_folder=self.parent)
        except:
            self.target_obj = None

        if self.target_obj:
            logger.error("Target already exists!")
            return Response(dict(error=["target_exists"], data=dict(target_name=new_target_name)),
                                 status=status.HTTP_400_BAD_REQUEST)
        else:
            try:
                self.target_obj = Target.objects.get(target_name=old_target_name, system_folder=self.parent,
                                                     created_by=self.user_obj)
            except:
                self.target_obj = None

            # if all conditional checks pass go ahead and edit the target name
            if self.target_obj:
                self.target_obj.target_name = new_target_name
                self.target_obj.save()
                logger.info("Target edited successfully!")
                return Response(dict(error=[], data=dict(target_name=new_target_name)),
                            status=status.HTTP_200_OK)
            else:
                logger.error("User not allowed to edit target!")
                return Response(dict(error=["user_not_allowed_to_edit_target"],
                                     data=dict(folder_name=old_target_name)),
                                status=status.HTTP_400_BAD_REQUEST)


class CreateSelectedMinionTarget(generics.ListCreateAPIView):

    """
        Create a target from the selected minions from the quick target.
    """

    def post(self, request):
        """
            POST view to create a target from the selected minions from the quick target.
            Parameters:
                {
                    "target_name": "<target_name>",
                    “is_user_favorite”: <boolean_value>,
                    "parent_id": "<parent_id>"
                    "minion_id_list": {"m1":1, "m2":2}
                }
            API: http://<hostname>/target/minion/add/
            Please make sure auth token is added in the header
        """

        minion_id_list = []

        self.userobj = request.user

        # Get target name
        target_name = request.DATA.get("target_name", None)

        # Check if the the target to be created is a public or private target
        is_user_favorite = request.DATA.get("is_user_favorite", False)

        # Get parent ID of the folder under which the target will be created
        parent_id = request.DATA.get("parent_id")

        # Get a list of minions which needs to be grouped to create a target
        minion_id_info = request.DATA.get("minion_id_info")

        if minion_id_info:
            minion_id_list = minion_id_info.values()

        if not target_name:
            return Response(dict(error=["target_name_empty"], data=dict()),
                            status=status.HTTP_400_BAD_REQUEST)

        # check if parent id is being, if not sent return an error
        if not parent_id:
            return Response(dict(error=["parent_not_selected"], data=dict()),
                            status=status.HTTP_400_BAD_REQUEST)

        # Check if parent id sent is valid, if not valid return an error
        try:
            parent_obj = SystemFolder.objects.get(id=parent_id)
        except:
            return Response(dict(error=["invalid_parent"], data=dict()),
                            status=status.HTTP_400_BAD_REQUEST)

        # check if target exists at the same level
        target_obj = Target.objects.filter(created_by=self.userobj, target_name=target_name,
                                           system_folder=parent_id).first()
        # if yes, raise an error
        if target_obj:
            return Response(dict(error=["target_exists_at_same_level"], data=dict()),
                            status=status.HTTP_400_BAD_REQUEST)

        # retrieve list of minions for the quick target which is to be saved
        minion_list = Minion.objects.filter(id__in=minion_id_list)

        if not minion_list:
            return Response(dict(error=["minion_doesnot_exists"], data=dict()),
                            status=status.HTTP_400_BAD_REQUEST)

        # Create parameters and try to validate against the serializers
        params = dict(target_name=target_name, created_by=self.userobj.id, created_at=datetime.datetime.now(),
                      system_folder=parent_id)

        serializer = TargetListSerializer(data=params)

        if not serializer.is_valid():
            # Process custom serializers error messages
            error_list = [
                e for error in serializer.errors.values() for e in error]
            return Response(dict(error=error_list, data={}), status=status.HTTP_400_BAD_REQUEST)

        serializer.save()

        target_minion_list = [TargetMinions.objects.create(target=serializer.object, minion=minion_obj)
                              for minion_obj in minion_list]

        try:
            if self.userobj and is_user_favorite:
                user_fav_obj = UserFavorites.objects.create(user=self.userobj, target=serializer.object)
        except:
            return Response(dict(error=["fav_already_exists"], data=dict()),
                            status=status.HTTP_400_BAD_REQUEST)

        return Response(dict(error=[], data=dict(target_name=target_name, minion_count=len(target_minion_list))),
                        status=status.HTTP_200_OK)


class ListAllTargets(generics.GenericAPIView):
    """
        View to list all the targets and indicate if there are any minions present
        URL: http://hostname/target/list/all/
        Method: POST
        Parameters: {"m1":1, "m2":2, "m3":3, "m4":4}
        Return: {
                    T1: {has_minion: True/False, in_multiple: True/False},
                    T2: {has_minion: True/False, in_multiple: True/False},
                    T3: {has_minion: True/False, in_multiple: True/False},
                    .
                    .
                }
    """

    def post(self, request):
        """
            View to list down all the targets and indicate if they contain any minion. Also
            indicates if minion in one target belongs to another target as well.

            Workflow:
            1. Get a list of all the minions from the POST parameter
            2. For each minion ID, filter TargetMinion table to get a list of targets in which minion exists.
            3. If target count is one, then minion belongs to only one target, mark in_multiple as False
            4. If target count is more than one, set in_multiple as True
        """

        data_dict = {}
        processed_target_list = []

        # Get user object from request
        self.userobj = request.user

        # Get minion ID from POST parameter
        minion_id_list = request.DATA.values()

        for mid in minion_id_list:
            # get all targets for listed minions
            targets = [obj.target \
                       for obj in TargetMinions.objects.\
                       filter(minion__id=mid).\
                       exclude(target__target_name="")]

            for target in targets:
                if (target.system_folder.get_root().name=="Private" and\
                    target.created_by==self.userobj) or\
                    target.system_folder.get_root().name=="Public":
                    processed_target_list.append(target.id)
                    # Indicates that minion is present in more than one target
                    if len(targets) > 1:
                        data_dict[target.id] = dict(has_minion=None,
                                                    target_name=\
                                                    target.target_name,
                                                    in_multiple=True)
                    else:
                        # Count less than equal to 1 exists in only one target
                        data_dict[target.id] = dict(has_minion=True,
                                                    target_name=\
                                                    target.target_name,
                                                    in_multiple=False)

        # to show empty target names
        targets = Target.objects.all().exclude(target_name="").\
        exclude(id__in=processed_target_list)
        for obj in targets:
            if (obj.system_folder.get_root().name=="Private" and\
                obj.created_by==self.userobj) or\
                obj.system_folder.get_root().name=="Public":
                data_dict[obj.id] = dict(
                                         has_minion=False,
                                         target_name=obj.target_name,
                                         in_multiple=False
                                         )

        return Response(dict(error=[], data=dict(data_dict=data_dict),
                             status=status.HTTP_200_OK))


class ModifySelectedTargets(generics.GenericAPIView):
    """
        View to modify the minions in the selected targets.
        URL: http://hostname/target/list/all/modify/
        Method: POST
        Parameters: minionList: {"m1":1, "m2":2, "m3":3, "m4":4}
        Return: targetList: {
                    T1: {has_minion: True/False, in_multiple: True/False},
                    T2: {has_minion: True/False, in_multiple: True/False},
                    T3: {has_minion: True/False, in_multiple: True/False},
                    .
                    .
                }
    """

    def post(self, request):
        """
            Get the target and minion list from the POST parameter and on the basis of the flag,
            set add/remote the minions from the respective targets.
        """

        # Get user object from request
        self.userobj = request.user

        # Get minion ID from POST parameter
        try:
            minion_id_list = request.DATA.get("minionList").values()
        except:
            minion_id_list = []

        target_id_list = request.DATA.get("targetList")

        if not minion_id_list or not target_id_list:
            return Response(dict(error=["target_or_minion_missing"], data=dict()),
                            status=status.HTTP_400_BAD_REQUEST)

        for target_id, flag_details in target_id_list.items():

            try:
                target_obj = Target.objects.get(id=target_id)
            except:
                target_obj = None

            if target_obj and flag_details.get("has_minion") == False:
                for minion_id in minion_id_list:
                    try:
                        minion_obj = Minion.objects.get(id=minion_id)
                    except:
                        minion_obj = None
                    if minion_obj:
                        TargetMinions.objects.filter(target=target_obj, minion=minion_obj).delete()
            elif target_obj and flag_details.get("has_minion") == True:
                for minion_id in minion_id_list:
                    minion_obj = Minion.objects.get(id=minion_id)
                    TargetMinions.objects.get_or_create(target=target_obj, minion=minion_obj)

        return Response(dict(error=[], data=dict(), status=status.HTTP_200_OK))


class ListTargetBeaconsView(generics.ListAPIView):
    """
        Retrieve List of Beacons associated with a Target for a specific user
        Method: GET
        URL: http://hostname/target/<target_id>/beacons/
        Please make sure auth token is added in the header
    """
    serializer_class = TargetBeaconsSerializer
    paginate_by = 100

    def get_queryset(self):
        """
            get queryset for minionbeacon for a particular target
        """
        self.target_id = int(self.kwargs['target_id'])
        minions = TargetMinions.objects.filter(target=self.target_id).values_list('minion', flat=True)
        return MinionBeacon.objects.filter(minion__id__in=minions)

    def list(self, request, *args, **kwargs):
        """
            send custom response overriding the list method
        """
        response = generics.ListAPIView.list(
            self, request, *args, **kwargs).data
        response.update({'target': {'id': self.target_id}})
        minions = self.object_list.values_list("minion__id", flat=True)
        active_beacons = MinionBeacon.objects.filter(minion_id__in=minions).values_list("beacon", flat=True)
        active_beacons = (list(set(active_beacons)))
        response.update({"active_beacons": active_beacons})

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

