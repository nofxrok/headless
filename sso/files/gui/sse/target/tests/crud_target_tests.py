"""
    Unit Tests for Target App
"""
from django.test import TestCase
from django.test import Client
from django.contrib.auth.models import User
from master.models import Master
from minion.models import Minion
from core.models import GlobalConfig
from target.models import Target, TargetMinions
from rest_framework.authtoken.models import Token
import json


class QuickTargetTestCase(TestCase):

    """
        Usage: python3 manage.py test target.tests
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

        self.master = Master.objects.create(
            hostname="localhost",
            netapi_port="8000",
            auth_mode="pam",
            created_by=self.user_obj,
            modified_by=self.user_obj
        )

        self.minion = Minion.objects.create(
            hostname="localhost",
            master=self.master,
            config={}
        )

        self.quick_target_obj = Target.objects.create(
            is_quick_target=True,
            created_by=self.user_obj)

        self.target_minion = TargetMinions.objects.create(
            target=self.quick_target_obj,
            minion=self.minion)

        self.token = Token.objects.create(key="testuser1", user=self.user_obj)

        self.global_config = GlobalConfig.objects.create(
            name="token_exp",
            value="60")

    def tearDown(self):
        """
            Destroy test objects
        """
        User.objects.all().delete()
        Master.objects.all().delete()
        Minion.objects.all().delete()
        Target.objects.all().delete()
        TargetMinions.objects.all().delete()

    def testminiondoesnotexists(self):
        """
            Test for adding a minion to a quick target which does not exist
        """
        self.Parameters = '{"m2":2}'
        response = self.c.post('/target/qt/add/',
                               self.Parameters, content_type="application/json",
                               **{"HTTP_AUTHORIZATION": "Token testuser1"})
        self.assertEqual(response.status_code, 400)

    def testaddminiontoquicktarget(self):
        """
            Test for adding a single minion to Quick Target
        """
        self.Parameters = '{"m1":1}'
        response = self.c.post('/target/qt/add/',
                               self.Parameters, content_type="application/json",
                               **{"HTTP_AUTHORIZATION": "Token testuser1"})
        self.assertEqual(response.status_code, 200)

    def testdeletequicktarget(self):
        """
            Test for deleting a Quick Target
        """
        response = self.c.delete('/target/qt/1/delete/', content_type="application/json",
                                 **{"HTTP_AUTHORIZATION": "Token testuser1"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(TargetMinions.objects.filter(target=self.quick_target_obj).count(), 0)

    def testmultipleminionadditon(self):
        """
            Test for adding multiple minions to a Quick Target
        """
        self.minion_2 = Minion.objects.create(hostname="127.0.0.1",
                                              master=self.master,
                                              config={})

        self.target_minion = TargetMinions.objects.create(target=self.quick_target_obj,
                                                          minion=self.minion_2)
        self.Parameters = '{"m1":1,"m2":2}'
        response = self.c.post('/target/qt/add/', self.Parameters, content_type="application/json",
                               **{"HTTP_AUTHORIZATION": "Token testuser1"})

        self.assertEqual(response.status_code, 200)

        self.assertEqual(TargetMinions.objects.filter(target=self.quick_target_obj).count(), 2)

    def testdeletequicktargetview(self):
        """
            Test for deleting a Quick Target
        """
        response = self.c.delete('/target/qt/delete/',
                                 content_type="application/json",
                                 **{"HTTP_AUTHORIZATION": "Token testuser1"})
        self.assertEqual(response.status_code, 200)

class TargetTestCases(TestCase):
    """
        Target Test Cases
    """
    def setUp(self):
        """
            Create test objects
        """
        self.c = Client()
        self.user_obj = User.objects.create_user(
            "testuser1",
            "testuser1@testuser1.com", "testuser1")

        self.master = Master.objects.create(
            hostname="localhost",
            netapi_port="8000",
            auth_mode="pam",
            created_by=self.user_obj,
            modified_by=self.user_obj)

        self.minion = Minion.objects.create(
            hostname="localhost",
            master=self.master,
            config={})

        self.quick_target_obj = Target.objects.create(
            target_name="testQTarget",
            is_quick_target=True,
            created_by=self.user_obj)

        self.quick_target_obj = Target.objects.create(
            target_name="testTarget",
            is_quick_target=False,
            created_by=self.user_obj)

        self.target_minion = TargetMinions.objects.create(
            target=self.quick_target_obj,
            minion=self.minion)

        self.token = Token.objects.create(key="testuser1", user=self.user_obj)

        self.global_config = GlobalConfig.objects.create(
            name="token_exp",
            value="60")

        self.Parameters = '{"m1":1}'
        response = self.c.post('/target/qt/add/',
                               self.Parameters, content_type="application/json",
                               **{"HTTP_AUTHORIZATION": "Token testuser1"})

    def tearDown(self):
        """
            Destroy test objects
        """
        User.objects.all().delete()
        Master.objects.all().delete()
        Minion.objects.all().delete()
        Target.objects.all().delete()
        TargetMinions.objects.all().delete()

    def testcreatetarget(self):
        """
            Test for creating a target
        """
        self.Parameters_Target = '{"target_name": "testTarget_1"}'
        response = self.c.post('/target/add/', self.Parameters_Target,
                               content_type="application/json",
                               **{"HTTP_AUTHORIZATION": "Token testuser1"})
        self.assertEqual(response.status_code, 200)

    def testcreateemptynametargert(self):
        """
            Test for checking if a empty target name is allowed
        """
        self.Parameters_Target = '{"target_name": }'
        response = self.c.post('/target/add/', self.Parameters_Target,
                               content_type="application/json",
                               **{"HTTP_AUTHORIZATION": "Token testuser1"})
        self.assertEqual(response.status_code, 400)

    def testlisttargetview(self):
        """
            Test for listing targets
        """
        response = self.c.get('/target/all/',
                              content_type="application/json",
                              **{"HTTP_AUTHORIZATION": "Token testuser1"})
        self.assertEqual(response.status_code, 200)

    def testlisttargetminionsview(self):
        """
            Test for listing minions from a target
        """
        response = self.c.get('/target/2/minions/',
                              content_type="application/json",
                              **{"HTTP_AUTHORIZATION": "Token testuser1"})
        self.assertEqual(response.status_code, 200)

    def testdeletetargetview(self):
        """
            Test for deleting a target
        """
        response = self.c.delete('/target/2/delete/',
                                 content_type="application/json",
                                 **{"HTTP_AUTHORIZATION": "Token testuser1"})
        self.assertEqual(response.status_code, 200)

    def testdeletetargetdoesntexists(self):
        """
            Test for deleting a target that does not exist
        """
        response = self.c.delete('/target/100/delete/', content_type="application/json",
                                 **{"HTTP_AUTHORIZATION": "Token testuser1"})
        self.assertEqual(response.status_code, 400)
