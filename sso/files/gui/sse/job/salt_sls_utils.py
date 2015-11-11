# temporary code needs to be removed when implementation is complete for sls
# import os, django, sys
# # Setup Django environment so that we can access Django models
# os.environ.setdefault("DJANGO_SETTINGS_MODULE", "sse.settings")
# sys.path.append(os.path.sep.join(os.getcwd().split(os.path.sep)[:-1]))
# django.setup()

"""
    Module to execute SLS files
"""
import json
import logging
import os

from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import User

from core.utils import request
from job.models import Job
from master.models import Master, MasterToken

logger = logging.getLogger("sse.core")

class SLS(object):
    """
        Wrapper class to execute sls files via rest API
    """

    def __init__(self, user_obj, master_obj, tgt="", job_obj=None):

        self.master = master_obj
        self.tgt = tgt
        self.sls_info = job_obj.sls_info
        self.user_obj = user_obj
        self.job_obj = job_obj
        self.master_token_obj = None

    def execute_sls(self):
        '''
        Execute the state or orchestration file
        '''
        try:
            self.master_token_obj = MasterToken.objects \
            .get(user__username=self.user_obj.username,
                 master=self.master)
        except ObjectDoesNotExist:
            logger.error('MasterToken not found for Master {0}'.format(self.master))

        filename, _ = os.path.splitext(self.sls_info.filename)
        test_env = False

        # below flag indicates if
        # job is going to be executed or simulated
        if self.job_obj.run_type == "simulate":
            test_env = True

        orchestrate_call = {
            'fun': 'state.orchestrate',
            'mods': [
                filename,
            ],
            'client': 'runner_async',
            'test': test_env
        }

        state_call = {
            'fun': 'state.sls',
            'tgt': ','.join(self.tgt),
            'expr_form': 'list',
            'client': 'local_async',
            'arg': filename,
            'kwarg': {
                'test': test_env,
                'metadata': {
                    'foo': 'bar'
                }
            }
        }

        sls_call = state_call

        if self.sls_info.file_type == 'orchestrate':
            sls_call = orchestrate_call

        headers = {
            'Content-Type': 'application/json',
            'X-Auth-Token': self.master_token_obj.token
        }

        try:
            response = self.master.api_post([sls_call], headers)
            return response.status
        except Exception as error:
            logger.debug("Error processing request %s." % error)



class AsyncSLS(object):
    """
        Wrapper class to execute the async jobs by scheduling and saving the schedule
    """

    def __init__(self, user_obj, master_obj, tgt, job_obj):

        self.master = master_obj
        self.tgt = tgt
        self.user_obj = user_obj
        self.job_obj = job_obj

    def execute_async_job(self):
        """
            To save the schedule and execute the future jobs
        """

        try:
            self.master_token_obj = MasterToken.objects.get(user__username=self.user_obj.username,
                                                            master=self.master)
        except:
            self.master_token_obj = None

        filename, ext = os.path.splitext(self.job_obj.sls_info.filename)

        if self.master_token_obj:

            # below flag indicates if the job is going to be executed or simulated
            if self.job_obj.run_type == "simulate":
                test_env = True
            else:
                test_env = False

            # low state for sls execution
            sls_call = {
                        "tgt": ",".join(self.tgt),
                        "client": "local_async",
                        "fun": "schedule.add",
                        "expr_form": "list",
                        "kwarg": {
                            "function": "state.sls",
                            "job_args": [filename],
                            "job_kwargs": {
                                           "test": test_env,
                                           },
                            "metadata": {
                                         "jid": self.job_obj.id
                                         },
                            "return_job": True,
                            "once": self.job_obj.execute_at.strftime("%Y-%m-%dT%H:%M:%S"),
                            "name": self.job_obj.sls_info.name+"_"+str(self.job_obj.id)
                        }
                    }
            headers = {'X-Auth-Token': self.master_token_obj.token}

            try:
                response = self.master.api_post(sls_call, headers)
            except Exception as error:
                logger.debug("Error processing request %s. Please check salt-api logs." % error)
                return 500

            if response.status == 200:
                # store the scheduler on the minion
                sch_status = self.store_scheduler()

                if sch_status == 200:
                    return 200
                else:
                    logger.debug("Error saving the scheduler call")
                    return 500

    def store_scheduler(self):
        '''
        Make http call to store the scheduler on the minion
        '''

        data_save = {
                     'tgt': ','.join(self.tgt),
                     'client': 'local',
                     'fun': 'schedule.save',
                     'expr_form': 'list',
        }

        headers = {'X-Auth-Token': self.master_token_obj.token}

        try:
            self.master.api(data_save, headers)
        except Exception as error:
            logger.debug('Error processing request %s.' % error)
            return 500

        return 200
