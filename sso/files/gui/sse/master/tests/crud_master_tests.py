from django.test import TestCase
from django.test import Client
from master.serializers import MasterSerializer
from django.contrib.auth.models import User
from master.models import Master
from core.models import GlobalConfig
from django.test import Client
from rest_framework.authtoken.models import Token
import datetime
import json


class MasterSerializerTest(TestCase):

    """
        Usage: python3 manage.py test master.tests
    """

    def setUp(self):
        """
            Create test objects
        """
        self.c = Client()
        self.user_obj = User.objects.create_user(
            "testuser1",
            "testuser1@testuser1.com", "testuser1"
        )

        self.token = Token.objects.create(key="testuser1", user=self.user_obj)

        self.global_config = GlobalConfig.objects.create(
            name="token_exp",
            value="60"
        )

        self.master = Master.objects.create(
            hostname="localhost",
            netapi_port="8000",
            auth_mode="pam",
            created_by=self.user_obj,
            modified_by=self.user_obj
        )

    def tearDown(self):
        """
            Destroy test objects
        """
        User.objects.all().delete()
        Master.objects.all().delete()

    def test_details(self):
        data_dict = {
            "hostname": "127.0.0.1",
            "netapi_port": 80,
            "auth_mode": "pam",
        }

        serializer = MasterSerializer(data=data_dict)
        current_date_time = datetime.datetime.now()

        if serializer.is_valid():
            serializer.object.created_by = self.user_obj
            serializer.object.created_at = current_date_time
            serializer.object.modified_by = self.user_obj
            serializer.object.modified_at = current_date_time
            # Save the POST form data
            serializer.save()

        # Check if one master is created
        self.assertEqual(len(Master.objects.all()), 2)
        self.assertTrue(Master.objects.get(hostname="127.0.0.1"))

    def test_list_master(self):
        """
            Unit test to check if listing all the masters is correct.
        """
        response = self.c.get('/master/all/', content_type='application/json',
                              **{"HTTP_AUTHORIZATION": "Token testuser1"})
        self.assertEqual(response.status_code, 200)
