from django.test import TestCase
from django.test import Client
from django.contrib.auth.models import User
from master.models import Master
from core.models import GlobalConfig
from rest_framework.authtoken.models import Token
import json


class UserDeleteTest(TestCase):

    """
        Usage: python3 manage.py test core.tests
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

        self.user_obj2 = User.objects.create_user(
            "testuser2",
            "testuser2@testuser2.com", "testuser2"
        )

        self.master = Master.objects.create(
            hostname="localhost",
            netapi_port="8000",
            auth_mode="pam",
            created_by=self.user_obj2,
            modified_by=self.user_obj2
        )

        self.token = Token.objects.create(key="testuser1", user=self.user_obj)

        self.global_config = GlobalConfig.objects.create(
            name="token_exp",
            value="60"
        )

    def tearDown(self):
        """
            Destroy test objects
        """
        User.objects.all().delete()
        Master.objects.all().delete()

    def test_delete(self):
        data = '{"h1": 1}'
        response = self.c.post(
            '/core/users/delete/',
            data,
            content_type='application/json',
            **{"HTTP_AUTHORIZATION": "Token testuser1"})
        self.assertEqual(response.status_code, 200)

    def test_delete_error(self):
        data = '{"h1": 1,"h2": "a"}'
        response = self.c.post(
            '/core/users/delete/',
            data,
            content_type='application/json',
            **{"HTTP_AUTHORIZATION": "Token testuser1"})
        status = json.loads(response.content.decode("utf-8")).get("status")
        self.assertEqual(status, 400)

    def test_null(self):
        data = '{"h1": 2}'
        response = self.c.post(
            '/core/users/delete/',
            data,
            content_type='application/json',
            **{"HTTP_AUTHORIZATION": "Token testuser1"})
        self.master = Master.objects.get(hostname="localhost")
        self.assertEqual(self.master.created_by, None)
        self.assertEqual(self.master.modified_by, None)


class UserAddTest(TestCase):

    """
        Test Case for adding a User
        Usage: python3 manage.py test core.tests
    """

    def setUp(self):
        """
            Create Test Object for user
        """
        self.c = Client()
        self.user_obj = User.objects.create_user(
            "testuser1", "testuser1@test.com", "testuser1")
        self.token = Token.objects.create(key="testuser1", user=self.user_obj)
        self.global_config = GlobalConfig.objects.create(
            name="token_exp", value="60")

    def tearDown(self):
        """
            Destroy test objects
        """
        User.objects.all().delete()

    def test_add_user(self):
        """
            test add user functionality
        """
        data = {"username": "test", "first_name": "test", "last_name": "user",
                "email": ",test@test.com", "type": "admin"}
        response = self.c.post(
            '/core/users/add/',
            data, content_type="application/json",
            **{"HTTP_AUTHORIZATION": "Token testuser1"})
        self.assertEqual(response.status_code, 400)

    def test_add_user_duplicate_entry(self):
        """
            test case for create duplicate user entry. A duplicate user entry should not be created
        """
        data = {"username": "testuser1", "password": "testuser1",
                "email": "testuser1@test.com"}
        response = self.c.post(
            '/core/users/add/',
            data, content_type='application/json',
            **{"HTTP_AUTHORIZATION": "Token testuser1"})
        self.assertEqual(response.status_code, 400)


class UserEditTest(TestCase):

    """
        Test case for Editing a User
        Usage: python3 manage.py test core.tests
    """

    def setUp(self):
        """
            Create Test Object for user
        """
        self.c = Client()
        self.user_obj = User.objects.create_user(
            "testuser1", "testuser1@test.com", "testuser1")
        self.token = Token.objects.create(key="testuser1", user=self.user_obj)
        self.global_config = GlobalConfig.objects.create(
            name="token_exp", value="60")

    def tearDown(self):
        """
            Destroy test objects
        """
        User.objects.all().delete()

    def test_edit_user(self):
        """
            test edit user functionality
        """
        data = {"first_name": "test1", "last_name": "user1",
                "email": "test1@test1.com", "type": "admin"}
        response = self.c.post(
            '/core/users/1/edit/',
            data, content='application/json',
            **{"HTTP_AUTHORIZATION": "Token testuser1"})
        userobj = User.objects.get(id=1)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(userobj.first_name, "test1")
        self.assertEqual(userobj.last_name, "user1")
        self.assertEqual(userobj.email, "test1@test1.com")
        self.assertEqual(userobj.userprofile.is_admin, True)

    def test_edit_invalid_user(self):
        """
            test case for edit an invalid user id
        """
        data = {"first_name": "test1", "last_name": "user1",
                "email": "test1@test1.com", "type": "admin"}
        response = self.c.post(
            '/core/users/50/edit/',
            data, content="application/json",
            **{"HTTP_AUTHORIZATION": "Token testuser1"})
        content = json.loads(response.content.decode('UTF-8'))
        self.assertEqual(content.get("status"), 400)
