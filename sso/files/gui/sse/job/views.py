"""
    Views to handle all request response related objects with respect to jobs
"""

from .models import (StateFolder, SLSInformation, JobTargetMinion,
                     UserJobNotification, salt_returns, salt_events, Job)
from .salt_sls_utils import SLS, AsyncSLS
from .serializers import (SLSInformationSerializer, JobSerializer,
                          MinionJobHistorySerializer, JobListSerializer,
                          SaltEventSerializer)
from django.conf import settings
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponse
from django.core.paginator import Paginator
from itertools import chain
from master.models import MasterToken
from master.service import LowDataAdapter
from minion.models import Minion
from mptt.templatetags.mptt_tags import cache_tree_children
from rest_framework import generics
from rest_framework import status
from rest_framework import views
from rest_framework.decorators import api_view
from rest_framework.response import Response
from target.models import Target, TargetMinions
import datetime
import json
import logging
import os


# logger settings
logger = logging.getLogger("sse.job")


class StateFolderFlatten:
    '''
    Class to handle
    flattening of public and
    private target trees
    '''

    def __init__(self):
        '''
        self.request is only applicable to
        private jobs
        '''
        self.request = None

    def get_private_tree(self, request):
        '''
        get tree structure for public targets
        '''
        outer = 'Private'
        inner = 'Public'
        self.request = request

        return self._get_tree_structure_json(outer,
                                             inner)

    def get_public_tree(self):
        '''
        get tree structure for public targets
        '''
        outer = 'Public'
        inner = 'Private'

        return self._get_tree_structure_json(outer,
                                             inner)

    def _get_tree_structure_json(self, outer, inner):
        '''
        Trivial iteration per row query is going to slow down
        the database. To
        avoid this, we should cache the children
        on each node so that those queries
        can be done all at once.
        django-mptt has a cache_tree_children() function we
        can do this with.
        '''

        # Get all system folders
        root_nodes = cache_tree_children(StateFolder.objects.all())

        tree_structure = []

        for root_node in root_nodes:
            if root_node.name == outer:
                tree_structure.append(self._recursive_node_to_dict(root_node))
                if root_node.name == inner:
                    break

        return tree_structure

    def _recursive_node_to_dict(self, node):
        '''
        Function called recursively to find
        the children till a leaf node is encountered.
        '''

        result = dict(id=node.pk, name=node.name)
        if node.parent is None:
            result.update(is_root=True)

        folder_id = result.get("id")
        try:
            state_folder_obj = StateFolder.objects.get(id=folder_id)
        except:
            state_folder_obj = None

        if state_folder_obj:
            if self.request:
                slsinformation_set = state_folder_obj \
                                     .slsinformation_set \
                                     .filter(created_by=self.request.user)
            else:
                slsinformation_set = state_folder_obj.slsinformation_set.all()
            sls_list = []
            for slsinfo in slsinformation_set:
                info = dict(name=slsinfo.name,
                            filename=slsinfo.filename,
                            location=slsinfo.location,
                            description=slsinfo.description,
                            file_type=slsinfo.file_type,
                            id=slsinfo.id)
                sls_list.append(info)
            result.update(job=sls_list)
        result.update(sls_count=len(slsinformation_set))

        if not self.request:
            children = [self._recursive_node_to_dict(child)
                        for child
                        in node.get_children()]
        else:
            children = [self._recursive_node_to_dict(child)
                        for child
                        in node.get_children() \
                        .filter(created_by=self.request.user)]

        if children:
            result['children'] = children

        return result


class PublicStateFolderView(generics.ListAPIView):
    '''
    View to list public state folder hierarchy structure
    URL: http://<hostname>/job/public/state/all/
    Method : GET
    Please make to add auth token in headers.
    '''


    def list(self, request, *args, **kwargs):
        '''
        send custom response using overriding the list method
        '''

        data = StateFolderFlatten().get_public_tree()

        return Response(dict(results=data, error=[]), status=status.HTTP_200_OK)


class PrivateStateFolderView(generics.ListAPIView):
    '''
    View to list system private state hierarchy structure
    URL: http://<hostname>/job/private/state/all/
    Method : GET
    Please make to add auth token in headers.
    '''

    def list(self, request, *args, **kwargs):
        '''
        send custom response using overriding the list method
        '''

        data = StateFolderFlatten().get_private_tree(request)

        return Response(dict(results=data, error=[]), status=status.HTTP_200_OK)


class UploadSLSView(views.APIView):
    """
        View to upload SLS files on the server.
        URL: http://hostname/job/upload/sls/
        Method: POST
        Parameters: filename, description, parent_folder_id
    """

    def post(self, request):
        """
            Get the SLS files from request parameter and write the file on the
            server
        """

        # Get user object from request
        self.userobj = request.user

        # Get name for the state file
        name = request.POST.get("name", "").strip()
        if not name:
            return Response(dict(error=["name_empty"], data=dict()),
                            status=status.HTTP_400_BAD_REQUEST)

        # Get parent id for sls file
        parent_folder_id = request.POST.get("parent_folder_id")
        if not parent_folder_id:
            return Response(dict(error=["parent_folder_id_empty"], data=dict()),
                            status=status.HTTP_400_BAD_REQUEST)

        # Get file object from file parameter
        self.sls_file_obj = request.FILES.get("sls_file")
        if not self.sls_file_obj:
            return Response(dict(error=["sls_file_empty"], data=dict()),
                            status=status.HTTP_400_BAD_REQUEST)

        # check if sls with same filename already exists
        try:
            sls_obj = SLSInformation.objects.get(filename=self.sls_file_obj)
        except ObjectDoesNotExist:
            sls_obj = None

        if sls_obj:
            return Response(dict(error=["duplicate_sls_file"], data=dict()),
                            status=status.HTTP_400_BAD_REQUEST)

        # Get SLS file type
        self.file_type = request.POST.get("file_type")
        if not self.file_type:
            return Response(dict(error=["invalid_file_type"], data=dict()),
                            status=status.HTTP_400_BAD_REQUEST)

        # Get description
        description = request.POST.get("description", "").strip()
        if not description:
            return Response(dict(error=["description_empty"], data=dict()),
                            status=status.HTTP_400_BAD_REQUEST)

        # Write file on the server
        folder_path, upload_status = self._write_file()

        if not upload_status:
            return Response(dict(error=["error_uploading_file"], data=dict()),
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            parent_folder_obj = StateFolder.objects.get(id=parent_folder_id)
        except Exception as e:
            return Response(dict(error=["Error: %s" % e], data=dict()),
                            status=status.HTTP_400_BAD_REQUEST)

        file_path = os.path.join(folder_path, self.sls_file_obj.name)

        params_dict = dict(
                           name=name, filename=self.sls_file_obj.name,
                           description=description,
                           location=file_path,
                           state_folder=parent_folder_obj.id,
                           created_by=self.userobj.id,
                           created_at=datetime.datetime.now(),
                           file_type=self.file_type
                           )

        serializer = SLSInformationSerializer(data=params_dict)
        if serializer.is_valid():
            serializer.save()
            return Response(dict(error=[], data=dict()),
                            status=status.HTTP_200_OK)
        else:
            # Error processing
            error_list = [
                e for error in serializer.errors.values() for e in error]
            return Response(dict(error=error_list, data={}),
                            status=status.HTTP_400_BAD_REQUEST)

        return Response(dict(error=[], data=dict(message=[params_dict])),
                        status=status.HTTP_200_OK)

    def _write_file(self):
        """
            1. Before making the wheel call write the file locally to the disk

            Write the file on the server. Creates a temporary directory under
            project directory and writes each chunk of in memory file object
            on the server's disk. Returns status message on
            the basis of the operation.

            2. Make a wheel call to upload the file to the user's master.
            From user object, get a list of all
            the masters. For each master, make a wheel call as shown below.

            salt.wheel.file_roots.write(data, path, saltenv='base', index=0,
            env=None)
            Write the named file, by default the first file found is written,
            but the index of the file can be specified to write to a lower
            priority file root

            URL: http://localhost:8000/
            Method: POST application/json
            Parameters: {
                        "fun": "file_roots.write",
                        "client": "wheel",
                        "data":"<actual file content>",
                        "path": "<filename.sls>"
                        }
        """

        # Get the filename
        filename = self.sls_file_obj.name

        # Use datetime stamp to create the folder
        datetime_stamp = datetime.datetime.now().strftime('%Y%m%d%H%M%S')

        # Folder path to have randon datetime as location
        folder_path = os.path.join(settings.SLS_UPLOAD_LOCATION, datetime_stamp)

        # If folder doesn't exists, create new folder and assign permission
        if not os.path.exists(folder_path):
            os.makedirs(folder_path)

        # Create filepath
        file_path = os.path.join(folder_path, filename)

        if folder_path:
            # Write the file to the required location
            with open(file_path, 'wb+') as in_memory_file:
                for chunk in self.sls_file_obj.chunks():
                    in_memory_file.write(chunk)
        else:
            return None, False

        upload_status = dict()

        try:
            file_content = open(file_path, "r").read()
        except:
            return None, False

        wheel_data = dict(fun="file_roots.write", client="wheel",
                          data=file_content, path=self.sls_file_obj.name)
        master_tokens = MasterToken.objects.filter(user=self.userobj)

        # for each user, make wheel call on all configured master
        for obj in master_tokens:
            headers = {
                'Content-Type': 'application/json',
                'X-Auth-Token': obj.token
            }

            try:
                response = obj.master.api_post(wheel_data, headers)
                content = json.loads(response.read().decode('utf-8'))
                upload_status[obj.master.hostname] = content.get("return")[0].\
                get("data").get("success")
            except Exception as error:
                logger.exception("Error processing request %s." % error)

        return folder_path, upload_status

class JobListView(generics.ListAPIView):
    """
        List down all the jobs in the database without public private segregation.
    """

    def _get_public_private_jobs(self):
        """
            To get a list of private jobs created by the user
        """

        jobs_list = []

        # Get a list of all the jobs which resides under public root folder
        public_jobs_objects = [obj for obj in SLSInformation.objects.all()
                               if obj.state_folder.get_root().name == "Public"]

        # Get a list of all the jobs which resides under private root folder
        private_jobs_objects = [obj for obj in SLSInformation.objects.filter(created_by=self.request.user)
                                if obj.state_folder.get_root().name == "Private"]

        total_jobs = list(chain(public_jobs_objects, private_jobs_objects))

        for obj in total_jobs:

            # get the job details for the associated sls file
            try:
                last_run = obj.job_set.all().order_by("-executed_at")[0].executed_at
            except:
                last_run = None

            jobs_list.append(dict(name=obj.name, filename=obj.filename, folder=obj.state_folder.name,
                             owner=obj.created_by.username, created_at=obj.created_at, last_run=last_run,
                             id=obj.id))

        return jobs_list

    def list(self, request, *args, **kwargs):
        """
            send custom response using overriding the list method
        """

        _jobs = self._get_public_private_jobs()

        return Response(dict(results=_jobs, error=[]), status=status.HTTP_200_OK)


class JobLeafView(generics.ListAPIView):
    """
        List down all the jobs in the database without public private segregation.
    """

    def _get_folder_object(self, uid):
        """
            Get the folder object on the basis of UID
        """

        try:
            state_folder_obj = StateFolder.objects.get(id=int(uid))
        except:
            return None

        return state_folder_obj

    def _get_leaf_jobs(self, uid):

        """
            To get a list of all leaf nodes
        """

        jobs_list = []

        state_folder_obj = self._get_folder_object(uid)

        if state_folder_obj:

            if state_folder_obj.is_root_node() and state_folder_obj.name == "Private":
                # Get private level jobs
                jobs = state_folder_obj.slsinformation_set.filter(created_by=self.user_obj)
            else:
                # Get current level sls files
                jobs = state_folder_obj.slsinformation_set.all()

            # Get all decendants of the root tree
            decendants = state_folder_obj.get_descendants()

            # Get all jobs listed under decedants
            decendant_jobs = [sls_obj for obj in decendants for sls_obj in obj.slsinformation_set.all()]

            # Combine all the jobs
            total_jobs = list(chain(decendant_jobs, jobs))

            # Return the data
            for obj in total_jobs:

                # get the job details for the associated sls file
                try:
                    last_run = obj.job_set.all().order_by("-executed_at")[0].executed_at
                except:
                    last_run = None

                jobs_list.append(
                                 dict(
                                      name=obj.name, filename=obj.filename, folder=obj.state_folder.name,
                                      owner=obj.created_by.username, created_at=obj.created_at,
                                      last_run=last_run, id=obj.id
                                      )
                                 )

        return jobs_list

    def list(self, request, uid, *args, **kwargs):
        """
            send custom response using overriding the list method
        """

        self.user_obj = request.user

        leaf_jobs = self._get_leaf_jobs(uid)

        return Response(dict(results=leaf_jobs, error=[]), status=status.HTTP_200_OK)


class CreateJobFolderView(views.APIView):
    """
        View to create a folder at any level
    """
    def post(self, request):
        """
            Create a folder at any level
            URL: http://<hostname>/job/folder/create/
            Parameters:
            {
                "parent_id":"<parent_id>"
                "folder_name": "<folder_name>"
            }
            Method: POST
            Please make to add auth token in headers.
        """
        user_obj = request.user
        parent_id = request.DATA.get("parent_id")
        folder_name = request.DATA.get("folder_name")

        folder_name = folder_name.strip() if folder_name else None

        if not folder_name:
            logger.error("Folder name empty!")
            return Response(dict(error=["folder_name_empty"],
                                 data=dict(folder_name=folder_name)),
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            parent = StateFolder.objects.get(id=parent_id)
        except:
            parent = None

        try:
            StateFolder.objects.create(name=folder_name,
                                       parent=parent,
                                       created_by=user_obj)
        except:
            logger.error("Folder already exists!")
            return Response(dict(error=["folder_name_exists"],
                                 data=dict(folder_name=folder_name)),
                            status=status.HTTP_400_BAD_REQUEST)

        logger.info("Folder successfully created!")
        return Response(dict(error=[], data=dict(folder_name=folder_name)),
                        status=status.HTTP_200_OK)


class EditJobFolderView(views.APIView):
    """
        View to edit a folder at any level
    """
    def post(self, request):
        """
            Create a folder at any level
            URL: http://<hostname>/job/folder/edit/
            Method: POST
            Parameters:
            {
                "folder_id":"<folder_id>"
                "folder_old_name": "<folder_old_name>"
                "folder_new_name": "<folder_new_name>"

            }
        """
        user_obj = self.request.user
        folder_id = request.DATA.get("folder_id")
        folder_old_name = request.DATA.get("folder_old_name")
        folder_new_name = request.DATA.get("folder_new_name")

        folder_old_name = folder_old_name.strip() if folder_old_name else None
        folder_new_name = folder_new_name.strip() if folder_new_name else None

        if not folder_new_name:
            logger.error("Folder name empty!")
            return Response(dict(error=["folder_name_empty"],
                                 data=dict(folder_name=folder_new_name)),
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            folder_obj = StateFolder.objects.get(id=folder_id,
                                                 name=folder_old_name)
        except:
            folder_obj = None

        if not folder_obj:
            logger.error("Folder name does not exists!")
            return Response(dict(error=["folder_name_does_not_exists"],
                                 data=dict(folder_name=folder_old_name)),
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            folder_obj.name = folder_new_name
            folder_obj.modified_by = user_obj
            folder_obj.save()
        except:
            logger.error("Folder already exists!")
            return Response(dict(error=["folder_name_exists"],
                                 data=dict(folder_name=folder_new_name)),
                            status=status.HTTP_400_BAD_REQUEST)

        logger.info("Folder successfully edited!")
        return Response(dict(error=[], data=dict(folder_name=folder_new_name)),
                        status=status.HTTP_200_OK)


class DeleteJobFolderView(views.APIView):
    """
        View to delete a folder at any level.
    """
    def post(self, request, uid):
        """
            Create a folder at any level
            URL: http://<hostname>/job/folder/delete<uid>//
            Method: POST
            Parameters:
            {}
        """
        try:
            folder_obj = StateFolder.objects.get(id=uid)
        except:
            folder_obj = None

        if not folder_obj:
            logger.error("Folder name does not exists!")
            return Response(dict(error=["folder_name_does_not_exists"],
                                 data=dict(id=uid)),
                            status=status.HTTP_400_BAD_REQUEST)

        folder_obj.delete()

        logger.info("Folder successfully edited!")
        return Response(dict(error=[], data=dict(id=uid)),
                        status=status.HTTP_200_OK)

def _send_job_execution_mail(execution_status, job_obj, master_details, notif_list):
    """
        method to collect all the data to send in the job executed notification mail
    """
    send_mail_to = []
    if notif_list:
        send_mail_to = [User.objects.get(id=user_id).email for user_id in notif_list]
    else:
        send_mail_to = [settings.DEFAULT_TO_EMAIL]
    try:
        message = "Job %s executed at %s by %s\n" % (job_obj.sls_info.name,
                                                    str(job_obj.execute_at),
                                                    str(job_obj.created_by.username))
        if not master_details:
            logger.error("Failed to send job execution status mail. Master details not found!")
        else:
            for master in master_details:
                if execution_status[master.hostname] == 200:
                    message = message + "\nMaster - %s; Status - Success; Minions - %s"\
                    %(master.hostname, str([minion.minion_id for minion in master_details[master]]))
                else:
                    message = message + "\nMaster - %s; Status - Fail; Minions - %s"\
                    %(master.hostname, str([minion.minion_id for minion in master_details[master]]))
            logging.info("Sending job execution status mail to %s ", ",".join(send_mail_to))
            send_mail('Job Execution Status', message, settings.EMAIL_HOST,
                      send_mail_to, fail_silently=False)
            logging.info("Job execution status mail sent.")
    except:
        logger.error("Error sending job execution status mail!")


class StoreAndExecuteJobView(views.APIView):
    """
        Stores the created job meta data and executes the job accordingly.
        URL:
        POST Parameters:
    """

    def post(self, request, uid):
        """
            Get the SLS files from request parameter and write the file on the server
        """

        # Get user object from request
        self.userobj = request.user

        # Get a list of minions on which the SLS needs to be executed
        self.minions = request.DATA.get("minions").values()
        if not self.minions:
            return Response(dict(error=["empty_minions"], data=dict()),
                            status=status.HTTP_400_BAD_REQUEST)

        # Get the job object which needs to be executed
        try:
            self.sls_obj = SLSInformation.objects.get(id=uid)
        except:
            return Response(dict(error=["invalid_sls"], data=dict()),
                            status=status.HTTP_400_BAD_REQUEST)

        # decides when the job needs to be executed
        self.execute = request.DATA.get("execute") # now|future
        if self.execute == "now":
            self.execute_at = datetime.datetime.now()
        elif self.execute == "future":
            self.execute_at = request.DATA.get("execute_at")

        # Get a list of users to be notified
        self.notification = request.DATA.get("notification")
        # decide how to retry - None|retry_count|end_after
        self.retry_option = request.DATA.get("retry_option")
        # Retry count integer
        self.retry_count = request.DATA.get("retry_count", 0)
        # retry till end_after date time stamp
        self.end_after = request.DATA.get("end_after", None)
        # run or simulate the job - run|simulate
        self.run_type = request.DATA.get("run_type")
        # pause or ignore errors - ignore|pause
        self.action_on_error = request.DATA.get("action_on_error")
        # priority settings - None|normal|medium|high
        self.priority = request.DATA.get("priority")

        # create and return job object
        job_creation_status, job_obj, error_list = self._store_job()
        if not job_creation_status: # return error codes if there are any errors
            return Response(dict(error=error_list, data=dict()), status=status.HTTP_400_BAD_REQUEST)

        # create objects for the users to notify
        self._notify_user_list(job_obj)

        # create master minion map on which the job needs to be executed
        master_details = self._create_master_minion_map()

        # decides how to execute a job (sync|async) and sets retries options
        execution_status = self._job_handler(master_details, job_obj)

        # send job execution mail to the recipients
        _send_job_execution_mail(execution_status, job_obj, master_details, self.notification)

        return Response(dict(error=[], data=dict(job_submit_status=execution_status),
                             status=status.HTTP_200_OK))

    def _job_handler(self, master_details, job_obj):
        """
            job handler decides if the job needs to be executed sync or async
        """
        if job_obj.execute == "now":
            # execute SLS job
            job_submit_status = self._execute_job(master_details, job_obj)
        elif job_obj.execute == "future":
            job_submit_status = self._execute_async_job(master_details, job_obj)
        else:
            return False

        return job_submit_status

    def _execute_job(self, master_details, job_obj):
        """
            execute the sls files on the respective minions
        """

        job_submit_status = dict()

        for master, minions in master_details.items():
            minion_host = [obj.minion_id for obj in minions]
            job_execution_obj = SLS(self.userobj, master, minion_host, job_obj)
            status_code = job_execution_obj.execute_sls()
            job_submit_status[master.hostname] = status_code

        return job_submit_status

    def _execute_async_job(self, master_details, job_obj):
        """
            execute the sls files on the respective minions asynchronously
        """

        job_submit_status = dict()

        for master, minions in master_details.items():
            minion_host = [obj.minion_id for obj in minions]
            job_execution_obj = AsyncSLS(self.userobj, master, minion_host, job_obj)
            status_code = job_execution_obj.execute_async_job()
            job_submit_status[master.hostname] = status_code

        return job_submit_status

    def _store_job(self):
        """
            Store the job information in the database
        """

        # params dict to create job object in the database
        params_dict = dict(sls_info=self.sls_obj.id, execute=self.execute, execute_at=self.execute_at,
                           retry_option=self.retry_option, retry_count=self.retry_count,
                           end_after=self.end_after, run_type=self.run_type,
                           action_on_error=self.action_on_error, priority=self.priority,
                           created_by=self.userobj.id, modified_by=self.userobj.id,
                           created_at=datetime.datetime.now(), modified_at=datetime.datetime.now())

        # pass params to serializer to validate values
        self.serializer = JobSerializer(data=params_dict)
        if self.serializer.is_valid():
            # save valid serializer
            self.serializer.save()
            # associate job to the requested minions on which the job needs to be executed
            self.minion_objects = Minion.objects.filter(id__in=self.minions)
            for obj in self.minion_objects:
                JobTargetMinion.objects.create(job=self.serializer.object, minion=obj)
            return True, self.serializer.object, []
        else:
            error_list = [e for error in self.serializer.errors.values() for e in error]
            return False, None, error_list

    def _create_master_minion_map(self):
        """
            create a dict of master and minions on which the job needs to  be executed
        """

        # create a list of master minion map on which the job needs to be executed
        master_details = dict()

        # master minion map dict to submit jobs for each minion
        for obj in self.minion_objects:
            if obj.master in master_details.keys():
                minion_list = master_details[obj.master]
                minion_list.append(obj)
                master_details[obj.master] = minion_list
            else:
                master_details[obj.master] = [obj]

        return master_details

    def _notify_user_list(self, job_obj):
        """
            Create a list of users who needs to be informed
        """

        # get a list of users which needs to be notified
        user_obj_list = User.objects.filter(id__in=self.notification)

        # for each user, create an entry in user job notification using which users will be informed
        [UserJobNotification.objects.create(job=job_obj, user=obj) for obj in user_obj_list]


class MinionJobHistory(generics.ListAPIView):
    """
        Api to list last five jobs executed on a selected minion
        URL: http://<hostname>/job/history/<minionid>/
        Method: GET
    """
    serializer_class = MinionJobHistorySerializer

    def get_queryset(self):
        """
            get query set
        """
        minion_obj = Minion.objects.get(id=self.kwargs.get("minionid"))
        return salt_returns.objects.filter(full_ret__contains={'id':minion_obj.minion_id}).reverse()[:5]

    def list(self, request, *args, **kwargs):
        """
            send custom response using overriding the list method
        """
        try:
            response = generics.ListAPIView.list(self, request, *args, **kwargs).data
        except:
            return Response(dict(error=["minion_doesnot_exists"], data=dict()),
                            status=status.HTTP_400_BAD_REQUEST)
        return Response(dict(data=response, error=[]), status=status.HTTP_200_OK)


class DownloadSLS(generics.ListAPIView):
    """
        API to download the SLS file from the server
        URL: http://<hostname>/job/download/<uid>/
        Method: GET
    """

    def get(self, request, uid):
        """
            Create a file wrapper to download the file
        """

        # get user object from request
        self.userobj = request.user

        # get sls file object
        try:
            sls_obj = SLSInformation.objects.get(id=uid)
        except:
            return Response(dict(error=["invalid_sls"], data=dict()),
                            status=status.HTTP_400_BAD_REQUEST)

        # get root folder details
        state_folder_obj = sls_obj.state_folder

        # check if root is private, validate for private downloads
        root = state_folder_obj.get_root()

        # deny access if user tries to download unauthorized file
        if root.name == "Private":
            if not sls_obj.created_by == self.userobj:
                return Response(dict(error=["permission_denied"], data=dict()),
                            status=status.HTTP_400_BAD_REQUEST)

        if os.path.exists(sls_obj.location) and os.path.isfile(sls_obj.location):
            # create a file wrapper to show the sls file content
            sls_file = open(sls_obj.location, 'r')
            wrapper = sls_file.read()#FileWrapper(sls_file)
            import json
            response = HttpResponse(json.dumps({"data": wrapper}), content_type='application/json')
            #response['Content-Length'] = os.path.getsize(sls_obj.location)
            return response
        else:
            # return error in case file does not exists
            return Response(dict(error=["file_doesnot_exists"], data=dict()),
                        status=status.HTTP_400_BAD_REQUEST)


class SLSJobHistory(generics.ListAPIView):
    """
        Api to list jobs executed using selected sls
        URL: http://<hostname>/job/sls/history/<sls_id>/
        Method: GET
    """
    model = Job
    serializer_class = JobListSerializer

    def get_sls_job_history(self):
        """
            method to retrieve SLS file execution history
        """
        # retrieve job objects based on the incoming SLS id
        job_objs = self.model.objects.filter(sls_info=self.kwargs['sls_id'])
        # retrieve all salt_returns objects
        job_history = salt_returns.objects.all()
        return_data = []
        # list comprehension to reduce complexity
        # retrieve instances of JobTargetMinions based on the jobs retrieved
        job_minion_objs = [job_obj.jobtargetminion_set.get_queryset() for job_obj in job_objs]
        # flatten the list retrieved in the above list comprehension
        job_minion_objs = list(chain(*job_minion_objs))
        for executed_job in job_history:
            for job_minion in job_minion_objs:
                full_ret = executed_job.full_ret
                metadata = None
                try:
                    if full_ret.get("fun_args") != []:
                        metadata = full_ret.get("fun_args")[0].get("metadata")
                except:
                    metadata = None
                try:
                    if not type(full_ret.get("return")) is bool:
                        comment = full_ret.get("return").get("comment")
                except:
                    comment = None
                if metadata:
                    # if the job_id matches the one in metadata, append it to return_data
                    if job_minion.job.id == metadata.get("jid"):
                        executed_at = full_ret.get("_stamp")
                        return_data.append(dict(
                                            id=full_ret.get("id"),
                                            jid=executed_job.jid,
                                            full_ret=full_ret,
                                            fun=executed_job.fun,
                                            comment=comment,
                                            success=executed_job.success,
                                            executed_at=executed_at))
                        break
        return dict(results=return_data, count=len(return_data))

    def list(self, request, *args, **kwargs):
        """
            send custom response using overriding the list method
        """
        sls_job_history = self.get_sls_job_history()
        return Response(dict(data=sls_job_history, error=[]), status=status.HTTP_200_OK)


class JobHistoryListView(generics.ListAPIView):
    '''
    API to retrieve data from salt_returns for a group of minions
    '''
    def get_minion_job_history(self, minions, page_number):
        '''
        Loop through minions and get their job history. Then parse it a bit.
        '''

        return_data = []

        for minion_id in minions:
            try:
                history = salt_returns.objects.filter(id=minion_id)
                for job in history:
                    full_ret = job.full_ret
                    return_data.append({
                        'id': job.id,
                        'full_ret': full_ret,
                        'fun': job.fun,
                        'jid': job.jid,
                        'comment': job.return_value,
                        'success': job.success,
                        'executed_at': full_ret.get('_stamp')
                    })
            except Exception as err:
                logger.error('Unhandled Exception {0}. in JobHistoryListView.get_minion_job_history'.format(err))

        '''
        Paginate only if more than 10 results returned
        '''
        if len(return_data) > 10:
            return_pages = Paginator(return_data, 10)
            previous_page_number = return_pages.page(page_number).previous_page_number() if return_pages.page(page_number).has_previous() else None
            next_page_number = return_pages.page(page_number).next_page_number() if return_pages.page(page_number).has_next() else None

            returned = return_pages.page(page_number).object_list
            pagination_info = {'next_page_number': next_page_number, 'previous_page_number': previous_page_number, 'total_pages': len(return_data)}
        else:
            returned = return_data
            pagination_info = {}

        return dict(results=returned, count=len(return_data), pagination=pagination_info)

    def list(self, request, *args, **kwargs):
        '''
        Since we have two different front ends sending data, we need some
        awkward logic to see if we already have a list of minions or just a
        target id.

        TODO: Change the front ends to use a single endpoint and consolidate
        parameters so we can remove this awkward if/else for a consistent API
        endpoint
        '''
        if 'mids' in self.request.QUERY_PARAMS:
            minion_ids = [int(item) for item in self.request.QUERY_PARAMS.get('mids').split(',')]
            minions = Minion.objects.filter(id__in=minion_ids).values_list('minion_id', flat=True)
        elif 'target_id' in self.kwargs:
            target_obj = Target.objects.get(id=self.kwargs['target_id'])
            minions = [obj.minion.minion_id for obj in TargetMinions.objects.filter(target=target_obj)]

        if 'page' in self.request.QUERY_PARAMS:
            page_number = self.request.QUERY_PARAMS.get('page')
        else:
            page_number = 1

        job_history = self.get_minion_job_history(minions, page_number)

        return Response(dict(data=job_history, error=[]), status=status.HTTP_200_OK)


class StoreAndExecuteTargetJobView(views.APIView):
    """
        Stores the created job meta data and executes the job on the selected target.
        URL: http://localhost/job/execute/target/(?P<uid>\d+)/
        POST Parameters:
    """

    def post(self, request, uid, tid):
        """
            Get the SLS files and target from request parameter and write the file on the server
        """

        # Get user object from request
        self.userobj = request.user

        # Get the job object which needs to be executed
        try:
            self.sls_obj = SLSInformation.objects.get(id=uid)
        except:
            return Response(dict(error=["invalid_sls"], data=dict()),
                            status=status.HTTP_400_BAD_REQUEST)

        # Get the job object which needs to be executed
        try:
            self.target_obj = Target.objects.get(id=tid)
        except:
            return Response(dict(error=["invalid_target"], data=dict()),
                            status=status.HTTP_400_BAD_REQUEST)

        # decides when the job needs to be executed
        self.execute = request.DATA.get("execute") # now|future
        if self.execute == "now":
            self.execute_at = datetime.datetime.now()
        elif self.execute == "future":
            self.execute_at = request.DATA.get("execute_at")

        # Get a list of users to be notified
        self.notification = request.DATA.get("notification")
        # decide how to retry - None|retry_count|end_after
        self.retry_option = request.DATA.get("retry_option")
        # Retry count integer
        self.retry_count = request.DATA.get("retry_count", 0)
        # retry till end_after date time stamp
        self.end_after = request.DATA.get("end_after", None)
        # run or simulate the job - run|simulate
        self.run_type = request.DATA.get("run_type")
        # pause or ignore errors - ignore|pause
        self.action_on_error = request.DATA.get("action_on_error")
        # priority settings - None|normal|medium|high
        self.priority = request.DATA.get("priority")

        # create and return job object
        job_creation_status, job_obj, error_list = self._store_job()
        if not job_creation_status: # return error codes if there are any errors
            return Response(dict(error=error_list, data=dict()), status=status.HTTP_400_BAD_REQUEST)

        # create objects for the users to notify
        self._notify_user_list(job_obj)

        # create master minion map on which the job needs to be executed
        master_details = self._create_master_minion_map()

        # decides how to execute a job (sync|async) and sets retries options
        execution_status = self._job_handler(master_details, job_obj)

        # send job execution mail to the recipients
        _send_job_execution_mail(execution_status, job_obj, master_details, self.notification)

        return Response(dict(error=[], data=dict(job_submit_status=execution_status),
                             status=status.HTTP_200_OK))

    def _job_handler(self, master_details, job_obj):
        """
            job handler decides if the job needs to be executed sync or async
        """
        if job_obj.execute == "now":
            # execute SLS job
            job_submit_status = self._execute_job(master_details, job_obj)
        elif job_obj.execute == "future":
            job_submit_status = self._execute_async_job(master_details, job_obj)
        else:
            return False

        return job_submit_status

    def _execute_job(self, master_details, job_obj):
        """
            execute the sls files on the respective minions
        """

        job_submit_status = dict()

        for master, minions in master_details.items():
            minion_host = [obj.minion_id for obj in minions]
            job_execution_obj = SLS(self.userobj, master, minion_host, job_obj)
            status_code = job_execution_obj.execute_sls()
            job_submit_status[master.hostname] = status_code

        return job_submit_status

    def _execute_async_job(self, master_details, job_obj):
        """
            execute the sls files on the respective minions asynchronously
        """

        job_submit_status = dict()

        for master, minions in master_details.items():
            minion_host = [obj.minion_id for obj in minions]
            job_execution_obj = AsyncSLS(self.userobj, master, minion_host, job_obj)
            status_code = job_execution_obj.execute_async_job()
            job_submit_status[master.hostname] = status_code

        return job_submit_status

    def _store_job(self):
        """
            Store the job information in the database
        """

        # params dict to create job object in the database
        params_dict = dict(sls_info=self.sls_obj.id, execute=self.execute, execute_at=self.execute_at,
                           retry_option=self.retry_option, retry_count=self.retry_count,
                           end_after=self.end_after, run_type=self.run_type,
                           action_on_error=self.action_on_error, priority=self.priority,
                           created_by=self.userobj.id, modified_by=self.userobj.id,
                           created_at=datetime.datetime.now(), modified_at=datetime.datetime.now())

        # pass params to serializer to validate values
        self.serializer = JobSerializer(data=params_dict)
        if self.serializer.is_valid():
            # save valid serializer
            self.serializer.save()
            # associate job to the requested minions on which the job needs to be executed
            self.minion_objects = [obj.minion for obj in self.target_obj.targetminions_set.all()]

            for obj in self.minion_objects:
                JobTargetMinion.objects.create(job=self.serializer.object, minion=obj)
            return True, self.serializer.object, []
        else:
            error_list = [e for error in self.serializer.errors.values() for e in error]
            return False, None, error_list

    def _create_master_minion_map(self):
        """
            create a dict of master and minions on which the job needs to  be executed
        """

        # create a list of master minion map on which the job needs to be executed
        master_details = dict()

        # master minion map dict to submit jobs for each minion
        for obj in self.minion_objects:
            if obj.master in master_details.keys():
                minion_list = master_details[obj.master]
                minion_list.append(obj)
                master_details[obj.master] = minion_list
            else:
                master_details[obj.master] = [obj]

        return master_details

    def _notify_user_list(self, job_obj):
        """
            Create a list of users who needs to be informed
        """

        # get a list of users which needs to be notified
        user_obj_list = User.objects.filter(id__in=self.notification)

        # for each user, create an entry in user job notification using which users will be informed
        [UserJobNotification.objects.create(job=job_obj, user=obj) for obj in user_obj_list]


class SaltEventListView(generics.ListAPIView):
    queryset = salt_events.objects.all()
    serializer_class = SaltEventSerializer

    @api_view(['GET'])
    def get_feed(request, limit=50):
        latest = salt_events.objects.filter(
            alter_time__gte=datetime.date.today(),
            tag__startswith='salt/beacon/' #TODO: remove hardcoding
            ).order_by('-alter_time')[:int(limit)]
        serialized = SaltEventSerializer(latest, many=True)

        return Response(
            serialized.data,
            status=200,
        )


class DeleteJobView(views.APIView):
    """
        View to delete a job - uploaded sls file
    """

    def post(self, request, uid):
        """
            Delete a job - uploaded sls file
            URL: http://<hostname>/job/delete/<uid>/
            Method: POST
            Parameters: URL Parameter job id
        """

        # get the sls object from the database
        try:
            sls_obj = SLSInformation.objects.get(id=uid)
        except:
            sls_obj = None

        # raise error if sls doesn't exists
        if not sls_obj:
            logger.error("error: invalid job id")
            return Response(dict(error=["job_doesnot_exists"],
                                 data=dict(id=uid)),
                            status=status.HTTP_400_BAD_REQUEST)

        # delete the sls file from the disk
        if os.path.exists(sls_obj.location):
            try:
                os.remove(sls_obj.location)
            except:
                # in case of failure, supress error message
                pass

        # delete the job object from the database
        sls_obj.delete()

        logger.info("sls deleted successfully")

        return Response(dict(error=[], data=dict(id=uid)),
                        status=status.HTTP_200_OK)
