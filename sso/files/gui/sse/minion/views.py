"""
    Views for handling Minion App APIs
"""

from .models import Minion
from .serializers import (MinionSerializer)
from core.models import (MinionFilter, SystemFolder)
from core.serializers import MinionFilterSerializer
from django.db.models import Q
from rest_framework import generics, filters
from rest_framework import status
from rest_framework import views
from rest_framework.response import Response
from target.models import (Target, TargetMinions)
import itertools
import logging

# logger settings
logger = logging.getLogger("sse.minion")


class MinionList(generics.ListCreateAPIView):

    """
        Purpose: List down all the minions for each master.
        API: http://<hostname>/minion/all/?mid=<master_ID>
        Auth Token: Authorization: Token 6c30b5fcf15c0073dee3bf31953d92792df027ca
        This API lists down all the connected minions to a master. Pass the master PK
        in GET method to list down all the connected minions. If no minions are connected,
        empty list will be returned. The return structure is shown below.
        {
           "data":{
              "count":4,
              "next":null,
              "previous":null,
              "results":[
                 {
                    "hostname":"172.27.104.66",
                    "config":{
                       "ip_interfaces":{
                          "lo":[
                             "127.0.0.1",
                             "::1"
                          ],
                          "eth0":[
                             "172.27.104.66",
                             "fe80::a00:27ff:fe7d:c6b3"
                          ]
                       },
                       "cpuarch":"x86_64",
                       "cpu_model":"Intel(R) Core(TM) i5-4570 CPU @ 3.20GHz",
                       "os":"Ubuntu"
                    }
                 },
                 {},
                 {},
                 {},
             ]
           },
           "error":[
           ]
        }
    """
    serializer_class = MinionSerializer
    filter_backends = (filters.OrderingFilter,)
    ordering_fields = ("hostname", "minion_id", "is_minion_up", "master")
    paginate_by = 100

    def get_queryset(self):
        """
            get query set
        """

        queryset = Minion.objects.all().order_by("-id")

        mid = self.request.QUERY_PARAMS.get('mid', None)

        if mid is not None:
            queryset = queryset.filter(master_id=mid)
        return queryset

    def list(self, request, *args, **kwargs):
        """
            send custom response using overriding the list method
        """
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


class MinionObject(generics.ListAPIView):
    """
        Purpose: Get minions details on the basis of ID.
        API: http://<hostname>/minion/<ID>/
        Auth Token: Authorization: Token 6c30b5fcf15c0073dee3bf31953d92792df027ca
        This API fetches the minion details from the database and returns a JSON object.
        The return structure is shown below.
        {
           "data":{
              "count":1,
              "next":null,
              "previous":null,
              "results":[
                 {
                    "id":3,
                    "hostname":"172.27.104.68",
                    "config":{
                       "cpuarch":"x86_64",
                       "ip_interfaces":{
                          "eth0":[
                             "172.27.104.66",
                             "fe80::a00:27ff:fe7d:c6b3"
                          ],
                          "lo":[
                             "127.0.0.1",
                             "::1"
                          ]
                       },
                       "cpu_model":"Intel(R) Core(TM) i5-4570 CPU @ 3.20GHz",
                       "os":"Ubuntu"
                    }
                 }
              ]
           },
           "error":[]
        }
    """
    serializer_class = MinionSerializer

    def get_queryset(self):
        """
            get query set
        """
        minion_id = self.kwargs['id']
        return Minion.objects.filter(id=minion_id)

    def list(self, request, *args, **kwargs):
        """
            send custom response using overriding the list method
        """
        response = generics.ListAPIView.list(
            self, request, *args, **kwargs).data
        return Response(dict(data=response, error=[]), status=status.HTTP_200_OK)


class MinionSaveFilter(views.APIView):
    """
        View to save a minion filter for a specific user
    """
    def post(self, request):
        """
            URL: http://<hostname>/minion/filter/save/
            Method: POST
            Parameters:
                {
                    filter_name: "<filter_name>",
                    search_type: "<search_type>", # Text(1), Grains(2), Both(3)
                    match_params: "<match_params>", # contains (1), does_not_contain(2),
                                                    # starts_with(3), ends_with(4)
                    search_text: "<search_text>",
                    search_field: "<search_field>", # Node(1), Master(2)
                                                    # Target Group(3), IP Address(4) ie. hostname
                    search_grains: "<search_grains>" # will contain json data
                }
        """
        self.user_obj = self.request.user
        self.filter_name = request.DATA.get("filter_name")
        self.search_type = request.DATA.get("search_type", 1)
        self.match_params = request.DATA.get("match_params", 1)
        self.search_text = request.DATA.get("search_text")
        self.search_field = request.DATA.get("search_field", 1)
        self.search_grains = request.DATA.get("search_grains", {})

        # Validation checks for filter_name
        if not self.filter_name:
            logger.error("Save filter failed. Filter name empty!")
            return Response(dict(error=["filter_name_empty"],
                                 data={}), status=status.HTTP_400_BAD_REQUEST)

        # Check if filter with same name exists
        try:
            minion_filter_obj = MinionFilter.objects.get(filter_name=self.filter_name,
                                                         user=self.user_obj)
        except:
            minion_filter_obj = None

        if minion_filter_obj:
            return Response(dict(error=["filter_name_exists"],
                                 data={}), status=status.HTTP_400_BAD_REQUEST)
        # Validation for search_text
        if not self.search_text and self.search_type == 1:
            logger.error("Save filter failed. Filter search text empty!")
            return Response(dict(error=["search_text_empty"],
                                 data={}), status=status.HTTP_400_BAD_REQUEST)

        # serialize the incoming data
        params = dict(user=self.user_obj.id, filter_name=self.filter_name, search_type=self.search_type,
                      match_parameters=self.match_params, search_text=self.search_text,
                      search_grains=self.search_grains, search_field=self.search_field)
        serializer = MinionFilterSerializer(data=params)

        if serializer.is_valid():
            serializer.save()
            return Response(dict(error=[], data=dict(filter_name=self.filter_name)),
                            status=status.HTTP_200_OK)
        else:
            # Return serializer errors
            error_list = [e for error in serializer.errors.values() for e in error]
            logger.error("MinionFilter Serialization Error!")
            logger.error(error_list)
            return Response(dict(error=error_list, data={}), status=status.HTTP_400_BAD_REQUEST)


class MinionFilterList(generics.ListAPIView):
    """
        API to return list of saved filter for a user
    """
    serializer_class = MinionFilterSerializer
    paginate_by = 100

    def get_queryset(self):
        """
            get query set
        """
        user_filters = MinionFilter.objects.filter(user=self.request.user).order_by("-id")
        return user_filters

    def list(self, request, *args, **kwargs):
        """
            send custom response overriding the list method
        """
        response = generics.ListAPIView.list(self, request,
                                             *args, **kwargs).data
        return Response(dict(data=response, error=[]), status=status.HTTP_200_OK)


def filter_target_minions(targets):
    """
        Method to return minions for the filtered targets
    """
    minions = []
    # get all minions for filtered targets
    for target in targets:
        minions.append([obj.minion for obj in
                        TargetMinions.objects.filter(target=target)])
    minions = list(itertools.chain(*minions))
    minions = list(set(minions))
    return minions


def get_folder_minions(folder_obj):
    """
        retrieve minions belonging to targets under a folder structure
    """
    target_list = list()
    target_minion_list = list()
    minion_list = None

    # get all descendants for the folder object select by the user
    folder_obj_list = folder_obj.get_descendants()

    # get targets under that folder
    [target_list.extend(folder.target_set.all()) for folder in folder_obj_list]

    # add targets under the user selected folder
    target_list.extend(folder_obj.target_set.all())

    # get TargetMinion instances for the targets
    [target_minion_list.extend(target.targetminions_set.all()) for target in target_list]

    # get minions from the target minions
    minion_list = [tgt_mn.minion.id for tgt_mn in target_minion_list]

    # remove duplicate minion entries in the list
    minion_list = list(set(minion_list))

    return minion_list, target_list


def filter_contains(search_in, search_text, tgt_id, folder_obj):
    """
        Method to filter minions containing search_text in
        Node, Master, Target Group, IP Address (i.e hostname) fields
        contains here is case insensitive (icontains)
    """
    target_minions = None
    if tgt_id:
        target_minions = [obj.minion.id for obj in TargetMinions.objects.filter(target=tgt_id)]
    if search_in == 1:
        # check if node name contains search_text
        qset = (Q(minion_id__icontains=search_text))
        if tgt_id:
            target_minions = Minion.objects.filter(id__in=target_minions).filter(qset)
            return target_minions
        # filter minions based on the folder selected
        elif folder_obj:
            folder_minions, _ = get_folder_minions(folder_obj)
            minions = Minion.objects.filter(id__in=folder_minions).filter(qset)
            return minions
        else:
            return Minion.objects.filter(qset)
    if search_in == 2:
        # check if master contains search_text
        qset = (Q(master__hostname__icontains=search_text))
        if tgt_id:
            target_minions = Minion.objects.filter(id__in=target_minions).filter(qset)
            return target_minions
        # filter minions based on the folder selected
        elif folder_obj:
            folder_minions, _ = get_folder_minions(folder_obj)
            minions = Minion.objects.filter(id__in=folder_minions).filter(qset)
            return minions
        else:
            return Minion.objects.filter(qset)
    if search_in == 3:
        if tgt_id:
            try:
                # retrieve the target object which contains search text
                target_obj = Target.objects.get(Q(id=tgt_id), Q(target_name__icontains=search_text))
                # get minions associated with the target which contains search text
                target_minions = [obj.minion for obj in TargetMinions.objects.filter(target=target_obj)]
                return target_minions
            except:
                return []
        # filter minions based on folder selected
        elif folder_obj:
            # get targets belonging to a folder selected
            _, target_list = get_folder_minions(folder_obj)
            # filter targets which contain search text
            target_list = [target for target in target_list
                            if search_text in target.target_name]
            minions = filter_target_minions(target_list)
            return minions
        else:
            # check if targets contain search_text
            # get all targets containing search text
            targets = Target.objects.filter(target_name__istartswith=search_text)
            minions = filter_target_minions(targets)
            return minions
    if search_in == 4:
        # check if hostname contains search_text
        qset = (Q(hostname__icontains=search_text))
        if tgt_id:
            target_minions = Minion.objects.filter(id__in=target_minions).filter(qset)
            return target_minions
        # filter minions based on the folder selected
        elif folder_obj:
            folder_minions, _ = get_folder_minions(folder_obj)
            minions = Minion.objects.filter(id__in=folder_minions).filter(qset)
            return minions
        else:
            return Minion.objects.filter(qset)


def filter_doesnotcontain(search_in, search_text, tgt_id, folder_obj):
    """
        Method to filter minions which do not contain
        search_text in fields Node, Master, Target Group, IP Address (i.e hostname)
    """
    target_minions = None
    if tgt_id:
        target_minions = [obj.minion.id for obj in TargetMinions.objects.filter(target=tgt_id)]
    if search_in == 1:
        # check if node name does not contain search_text
        qset = (~Q(minion_id__icontains=search_text))
        if tgt_id:
            target_minions = Minion.objects.filter(id__in=target_minions).filter(qset)
            return target_minions
        # filter minions based on the folder selected
        elif folder_obj:
            folder_minions, _ = get_folder_minions(folder_obj)
            minions = Minion.objects.filter(id__in=folder_minions).filter(qset)
            return minions
        else:
            return Minion.objects.filter(qset)
    if search_in == 2:
        # check if master does not contain search_text
        qset = (~Q(master__hostname__icontains=search_text))
        if tgt_id:
            target_minions = Minion.objects.filter(id__in=target_minions).filter(qset)
            return target_minions
        # filter minions based on the folder selected
        elif folder_obj:
            folder_minions, _ = get_folder_minions(folder_obj)
            minions = Minion.objects.filter(id__in=folder_minions).filter(qset)
            return minions
        else:
            return Minion.objects.filter(qset)
    if search_in == 3:
        # check if targets does not contain search_text
        if tgt_id:
            try:
                # retrieve the target object which does not contain search text
                target_obj = Target.objects.get(~Q(id=tgt_id), ~Q(target_name__icontains=search_text))
                # get minions associated with the target which does not contain search text
                target_minions = [obj.minion for obj in TargetMinions.objects.filter(target=target_obj)]
                return target_minions
            except:
                return []
        # filter minions based on folder selected
        elif folder_obj:
            # get targets belonging to a folder selected
            _, target_list = get_folder_minions(folder_obj)
            # filter targets which contain search text
            target_list = [target for target in target_list
                            if search_text not in target.target_name]
            minions = filter_target_minions(target_list)
            return minions
        else:
            targets = Target.objects.filter(target_name__istartswith=search_text)
            minions = filter_target_minions(targets)
            return minions
    if search_in == 4:
        # check if hostname does not contain search_text
        qset = (~Q(hostname__icontains=search_text))
        if tgt_id:
            target_minions = Minion.objects.filter(id__in=target_minions).filter(qset)
            return target_minions
        # filter minions based on the folder selected
        elif folder_obj:
            folder_minions, _ = get_folder_minions(folder_obj)
            minions = Minion.objects.filter(id__in=folder_minions).filter(qset)
            return minions
        else:
            return Minion.objects.filter(qset)


def filter_startswith(search_in, search_text, tgt_id, folder_obj):
    """
        Method to filter minions which start with
        search_text in fields Node, Master, Target Group, IP Address (i.e hostname)
        startswith here is case insensitive (istartswith)
    """
    target_minions = None
    if tgt_id:
        target_minions = [obj.minion.id for obj in TargetMinions.objects.filter(target=tgt_id)]
    if search_in == 1:
        # check if node name starts with search_text
        qset = (Q(minion_id__istartswith=search_text))
        if tgt_id:
            target_minions = Minion.objects.filter(id__in=target_minions).filter(qset)
            return target_minions
        # filter minions based on the folder selected
        elif folder_obj:
            folder_minions, _ = get_folder_minions(folder_obj)
            minions = Minion.objects.filter(id__in=folder_minions).filter(qset)
            return minions
        else:
            return Minion.objects.filter(qset)
    if search_in == 2:
        # check if master starts with search_text
        qset = (Q(master__hostname__istartswith=search_text))
        if tgt_id:
            target_minions = Minion.objects.filter(id__in=target_minions).filter(qset)
            return target_minions
        # filter minions based on the folder selected
        elif folder_obj:
            folder_minions, _ = get_folder_minions(folder_obj)
            minions = Minion.objects.filter(id__in=folder_minions).filter(qset)
            return minions
        else:
            return Minion.objects.filter(qset)
    if search_in == 3:
        # check if targets starts with search_text
        if tgt_id:
            try:
                # get target object which startswith search text
                target_obj = Target.objects.get(Q(id=tgt_id), Q(target_name__istartswith=search_text))
                # get minions associated with the target which startswith search text
                target_minions = [obj.minion for obj in TargetMinions.objects.filter(target=target_obj)]
                return target_minions
            except:
                return []
        # filter minions based on folder selected
        elif folder_obj:
            # get targets belonging to a folder selected
            _, target_list = get_folder_minions(folder_obj)
            # filter targets which contain search text
            target_list = [target for target in target_list
                            if target.target_name.startswith(search_text)]
            minions = filter_target_minions(target_list)
            return minions
        else:
            # check if targets startswith search_text
            # get all targets starting with search text
            targets = Target.objects.filter(target_name__istartswith=search_text)
            minions = filter_target_minions(targets)
            return minions
    if search_in == 4:
        # check if hostname starts with search text
        qset = (Q(hostname__istartswith=search_text))
        if tgt_id:
            target_minions = Minion.objects.filter(id__in=target_minions).filter(qset)
            return target_minions
        # filter minions based on the folder selected
        elif folder_obj:
            folder_minions, _ = get_folder_minions(folder_obj)
            minions = Minion.objects.filter(id__in=folder_minions).filter(qset)
            return minions
        else:
            return Minion.objects.filter(qset)


def filter_endswith(search_in, search_text, tgt_id, folder_obj):
    """
        Method to filter minions which end with search_text
        in fields Node, Master, Target Group, IP Address (i.e hostname)
    """
    target_minions = None
    if tgt_id:
        target_minions = [obj.minion.id for obj in TargetMinions.objects.filter(target=tgt_id)]
    if search_in == 1:
        # check if node name ends with search_text
        qset = (Q(minion_id__endswith=search_text))
        if tgt_id:
            target_minions = Minion.objects.filter(id__in=target_minions).filter(qset)
            return target_minions
        # filter minions based on the folder selected
        elif folder_obj:
            folder_minions, _ = get_folder_minions(folder_obj)
            minions = Minion.objects.filter(id__in=folder_minions).filter(qset)
            return minions
        else:
            return Minion.objects.filter(qset)
    if search_in == 2:
        # check if master ends with search_text
        qset = (Q(master__hostname__endswith=search_text))
        if tgt_id:
            target_minions = Minion.objects.filter(id__in=target_minions).filter(qset)
            return target_minions
        # filter minions based on the folder selected
        elif folder_obj:
            folder_minions, _ = get_folder_minions(folder_obj)
            minions = Minion.objects.filter(id__in=folder_minions).filter(qset)
            return minions
        else:
            return Minion.objects.filter(qset)
    if search_in == 3:
        # check if targets end with search_text
        if tgt_id:
            try:
                # get target object which endswith search text
                target_obj = Target.objects.get(Q(id=tgt_id), Q(target_name__endswith=search_text))
                # get minions associated with the target which endswith search text
                target_minions = [obj.minion for obj in TargetMinions.objects.filter(target=target_obj)]
                return target_minions
            except:
                return []
        # filter minions based on folder selected
        elif folder_obj:
            # get targets belonging to a folder selected
            _, target_list = get_folder_minions(folder_obj)
            # filter targets which contain search text
            target_list = [target for target in target_list
                            if target.target_name.endswith(search_text)]
            minions = filter_target_minions(target_list)
            return minions
        else:
            # check if targets endswith search_text
            # get all targets ending with search text
            targets = Target.objects.filter(target_name__endswith=search_text)
            minions = filter_target_minions(targets)
            return minions
    if search_in == 4:
        # check if hostname ends with search_text
        qset = (Q(hostname__endswith=search_text))
        if tgt_id:
            target_minions = Minion.objects.filter(id__in=target_minions).filter(qset)
            return target_minions
        # filter minions based on the folder selected
        elif folder_obj:
            folder_minions, _ = get_folder_minions(folder_obj)
            minions = Minion.objects.filter(id__in=folder_minions).filter(qset)
            return minions
        else:
            return Minion.objects.filter(qset)


def filter_exactmatches(search_in, search_text, tgt_id, folder_obj):
    """
        Method to filter minions which exact match the search text
        in fields Node, Master, Target Group, IP address (i.e hostname)
    """
    target_minions = None
    if tgt_id:
        target_minions = [obj.minion.id for obj in TargetMinions.objects.filter(target=tgt_id)]
    if search_in == 1:
        # check if node name exact matches the search_text
        qset = (Q(minion_id__exact=search_text))
        if tgt_id:
            target_minions = Minion.objects.filter(id__in=target_minions).filter(qset)
            return target_minions
        # filter minions based on the folder selected
        elif folder_obj:
            folder_minions, _ = get_folder_minions(folder_obj)
            minions = Minion.objects.filter(id__in=folder_minions).filter(qset)
            return minions
        else:
            return Minion.objects.filter(qset)
    if search_in == 2:
        # check if master exact matches the search text
        qset = (Q(master__hostname__exact=search_text))
        if tgt_id:
            target_minions = Minion.objects.filter(id__in=target_minions).filter(qset)
            return target_minions
        # filter minions based on the folder selected
        elif folder_obj:
            folder_minions, _ = get_folder_minions(folder_obj)
            minions = Minion.objects.filter(id__in=folder_minions).filter(qset)
            return minions
        else:
            return Minion.objects.filter(qset)
    if search_in == 3:
        # check if target name exact matches with search_text
        if tgt_id:
            try:
                # get target object which exact matches search text
                target_obj = Target.objects.get(Q(id=tgt_id), Q(target_name__istartswith=search_text))
                # get minions associated with the target which exact matches search text
                target_minions = [obj.minion for obj in TargetMinions.objects.filter(target=target_obj)]
                return target_minions
            except:
                return []
        # filter minions based on folder selected
        elif folder_obj:
            # get targets belonging to a folder selected
            _, target_list = get_folder_minions(folder_obj)
            # filter targets which contain search text
            target_list = [target for target in target_list
                            if target.target_name == search_text]
            minions = filter_target_minions(target_list)
            return minions
        else:
            # check if targets exact matches with search_text
            # get all targets exact matches with search text
            targets = Target.objects.filter(target_name__istartswith=search_text)
            minions = filter_target_minions(targets)
            return minions
    if search_in == 4:
        # check if hostname exact matches with search text
        qset = (Q(hostname__exact=search_text))
        if tgt_id:
            target_minions = Minion.objects.filter(id__in=target_minions).filter(qset)
            return target_minions
        # filter minions based on the folder selected
        elif folder_obj:
            folder_minions, _ = get_folder_minions(folder_obj)
            minions = Minion.objects.filter(id__in=folder_minions).filter(qset)
            return minions
        else:
            return Minion.objects.filter(qset)


class FilterMinions(generics.ListAPIView):
    """
        API to search for minions depending on
        the search criteria sent by the user
        URL: http://<hostname>/minion/search/
        Example URL: http://<hostname>/minion/search/?in=1&as=2&text=ubuntu
    """
    serializer_class = MinionSerializer
    filter_backends = (filters.OrderingFilter,)
    ordering_fields = ("hostname", "minion_id", "is_minion_up", "master")
    paginate_by = 100

    def get_queryset(self):
        """
            get the minions which match the search criteria
        """
        search_in = int(self.request.GET.get("in"))
        search_as = int(self.request.GET.get("as"))
        search_text = self.request.GET.get("text")
        tgt_id = self.request.GET.get("tgt_id")
        folder_id = self.request.GET.get("folder_id")
        folder_obj = None
        try:
            folder_obj = SystemFolder.objects.get(id=folder_id)
        except:
            folder_obj = None

        if search_as == 1: # filter out contains search_text
            minions = filter_contains(search_in, search_text, tgt_id, folder_obj)
            return minions
        if search_as == 2: # filter out does not contain search_text
            minions = filter_doesnotcontain(search_in, search_text, tgt_id, folder_obj)
            return minions
        if search_as == 3: # filter out starts with search_text
            minions = filter_startswith(search_in, search_text, tgt_id, folder_obj)
            return minions
        if search_as == 4: # filter out ends with search_text
            minions = filter_endswith(search_in, search_text, tgt_id, folder_obj)
            return minions
        if search_as == 5: # filter out minions with exact matches
            minions = filter_exactmatches(search_in, search_text, tgt_id, folder_obj)
            return minions

    def list(self, request, *args, **kwargs):
        """
            send custom response overriding the list method
        """
        response = generics.ListAPIView.list(self, request, *args, **kwargs).data
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


class FilterMinionsByGrains(generics.ListAPIView):
    """
        View to filter minions by grain values
        URL: http://<hostname>/minion/searchbygrains/
        Example URL: http://<hostname>/minion/searchbygrains/?grain1=<value1>&grain2=<value2>&grain3=<value3>
        Method: GET
        Header: Authorization: Token 16dc33264b2bbf1f1c25a2099bf2fef75edf28fe1
    """
    serializer_class = MinionSerializer
    paginate_by = 100

    def get_queryset(self):
        """
            get minions which match the search criteria
        """
        grain1 = self.request.GET.get("grain1")
        grain2 = self.request.GET.get("grain2")
        grain3 = self.request.GET.get("grain3")

        value1 = self.request.GET.get("value1")
        value2 = self.request.GET.get("value2")
        value3 = self.request.GET.get("value3")
        tgt_id = self.request.GET.get("tgt_id")
        folder_id = self.request.GET.get("folder_id")
        folder_obj = None

        if folder_id:
            try:
                folder_obj = SystemFolder.objects.get(id=folder_id)
            except:
                return []
        minions = None
        filtered_minions = []
        if tgt_id:
            minions = [obj.minion for obj in TargetMinions.objects.filter(target=tgt_id)]
        elif folder_obj:
            minions, _ = get_folder_minions(folder_obj)
            minions = Minion.objects.filter(id__in=minions)
        else:
            minions = Minion.objects.all()
        for minion in minions:
            try:
                if grain1 and minion.config and minion.config[grain1]:
                    if value1 in minion.config[grain1]:
                        filtered_minions.append(minion)
                if grain2 and minion.config and minion.config[grain2]:
                    if value2 in minion.config[grain2]:
                        filtered_minions.append(minion)
                if grain3 and minion.config and minion.config[grain3]:
                    if value3 in minion.config[grain3]:
                        filtered_minions.append(minion)
            except:
                logger.error("Key error in searching for one of the grains : %s, %s, %s" % (grain1, grain2, grain3))
        return list(set(filtered_minions))

    def list(self, request, *args, **kwargs):
        """
            send custom response overriding the list method
        """
        response = generics.ListAPIView.list(self, request, *args, **kwargs).data
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
