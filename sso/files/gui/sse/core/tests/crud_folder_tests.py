"""
    Usage: python3 manage.py test core.tests
"""

from core.models import GlobalConfig
from core.models import SystemFolder
from django.contrib.auth.models import User
from django.test import Client
from django.test.testcases import TestCase
from rest_framework.authtoken.models import Token

class CreateSystemFolderViewTest(TestCase):
    """
        Test case class for creating folder
        Usage: python3 manage.py test core.tests
    """
    def setUp(self):
        """
            Create Test Object for user , public and private folder
        """
        self.client = Client()
        self.user_obj = User.objects.create_user(
            "testuser1",
            "testuser1@testuser1.com", "testuser1"
        )
        self.token = Token.objects.create(key="testuser1", user=self.user_obj)
        self.global_config = GlobalConfig.objects.create(
            name="token_exp",
            value="60"
        )
        self.pubic_folder = SystemFolder.objects.create(
            name="Public"
        )
        self.private_folder = SystemFolder.objects.create(
            name="Private"
        )
        self.test_folder = SystemFolder.objects.create(
            name="testFolder",
            parent=self.pubic_folder
        )

    def tearDown(self):
        """
            Destroy test objects
        """
        User.objects.all().delete()
        SystemFolder.objects.all().delete()

    def test_create(self):
        """
            Test case for creating folder
        """
        data = '{"parent_id": "1","folder_name": "A"}'
        response = self.client.post(
            '/core/folder/create/',
            data, content_type='application/json',
            **{"HTTP_AUTHORIZATION": "Token testuser1"})
        self.assertEqual(response.status_code, 200)

    def test_create_empty_folder_name(self):
        """
            Test case for creating folder without name
        """
        data = '{"parent_id": "1","folder_name": ""}'
        response = self.client.post(
            '/core/folder/create/',
            data, content_type='application/json',
            **{"HTTP_AUTHORIZATION": "Token testuser1"})
        self.assertEqual(response.status_code, 400)

    def test_folder_already_exists(self):
        """
            Test case for folder already exists
        """
        data = '{"parent_id": "1","folder_name": "testFolder"}'
        response = self.client.post(
            '/core/folder/create/',
            data, content_type='application/json',
            **{"HTTP_AUTHORIZATION": "Token testuser1"})
        self.assertEqual(response.status_code, 400)

class DeleteSystemFolderViewTest(TestCase):
    """
        Test case class for deleting folder
    """
    def setUp(self):
        """
            Create Test Object for user , public and private folder
        """
        self.client = Client()
        self.user_obj = User.objects.create_user(
            "testuser1",
            "testuser1@testuser1.com", "testuser1"
        )
        self.token = Token.objects.create(key="testuser1", user=self.user_obj)
        self.global_config = GlobalConfig.objects.create(
            name="token_exp",
            value="60"
        )
        self.pubic_folder = SystemFolder.objects.create(
            name="Public"
        )
        self.private_folder = SystemFolder.objects.create(
            name="Private"
        )
        self.test_folder = SystemFolder.objects.create(
            name="testFolder",
            parent=self.pubic_folder
        )

    def tearDown(self):
        """
            Destroy test objects
        """
        User.objects.all().delete()
        SystemFolder.objects.all().delete()

    def test_delete_folder_doesnt_exist(self):
        """
            Test case for deleting folder which doesnt exists
        """
        response = self.client.post(
            '/core/folder/delete/100/',
            content_type='application/json',
            **{"HTTP_AUTHORIZATION": "Token testuser1"})
        self.assertEqual(response.status_code, 400)

    def test_delete_folder(self):
        """
            Test case for deleting folder
        """
        response = self.client.post(
            '/core/folder/delete/3/',
            content_type='application/json',
            **{"HTTP_AUTHORIZATION": "Token testuser1"})
        self.assertEqual(response.status_code, 200)

class EditSystemFolderViewTest(TestCase):
    """
        Test case class for editing folder
    """
    def setUp(self):
        """
            Create Test Object for user , public and private folder
        """
        self.client = Client()
        self.user_obj_1 = User.objects.create_user(
            "testuser1",
            "testuser1@testuser1.com", "testuser1"
        )
        self.token = Token.objects.create(key="testuser1", user=self.user_obj_1)
        self.global_config = GlobalConfig.objects.create(
            name="token_exp",
            value="60"
        )
        self.user_obj_2 = User.objects.create_user(
            "testuser2",
            "testuser2@testuser2.com", "testuser2"
        )
        self.token = Token.objects.create(key="testuser2", user=self.user_obj_2)
        self.global_config = GlobalConfig.objects.create(
            name="token_exp",
            value="60"
        )
        self.pubic_folder = SystemFolder.objects.create(
            name="Public"
        )
        self.private_folder = SystemFolder.objects.create(
            name="Private"
        )
        self.test_folder = SystemFolder.objects.create(
            name="testFolder",
            parent=self.pubic_folder,
            created_by=self.user_obj_1
        )

    def tearDown(self):
        """
            Destroy test objects
        """
        User.objects.all().delete()
        SystemFolder.objects.all().delete()

    def test_edit_empty_folder_name(self):
        """
            Test case to edit folder with empty new name
        """
        data = '{"parent_id": "1","folder_old_name": "testFolder","folder_new_name": ""}'
        response = self.client.post(
            '/core/folder/edit/',
            data, content_type='application/json',
            **{"HTTP_AUTHORIZATION": "Token testuser1"})
        self.assertEqual(response.status_code, 400)

    def test_edit_invalid_parent(self):
        """
            Test case to edit folder with invalid parent name
        """
        data = '{"parent_id": "100","folder_old_name": "testFolder","folder_new_name": "testNewFolder"}'
        response = self.client.post(
            '/core/folder/edit/',
            data, content_type='application/json',
            **{"HTTP_AUTHORIZATION": "Token testuser1"})
        self.assertEqual(response.status_code, 400)

    def test_edit_invalid_folder(self):
        """
            Test case for invalid folder
        """
        data = '{"parent_id": "1","folder_old_name": "testFolder_1","folder_new_name": "testNewFolder"}'
        response = self.client.post(
            '/core/folder/edit/',
            data, content_type='application/json',
            **{"HTTP_AUTHORIZATION": "Token testuser1"})
        self.assertEqual(response.status_code, 400)

    def test_edit_folder_allready_exist(self):
        """
            Test case for folder already exists
        """
        data = '{"parent_id": "1","folder_old_name": "testFolder","folder_new_name": "testFolder"}'
        response = self.client.post(
            '/core/folder/edit/',
            data, content_type='application/json',
            **{"HTTP_AUTHORIZATION": "Token testuser1"})
        self.assertEqual(response.status_code, 400)

    def test_edit_invalid_user(self):
        """
            Test case to edit folder by invalid user
        """
        data = '{"parent_id": "1","folder_old_name": "testFolder","folder_new_name": "testNewFolder"}'
        response = self.client.post(
            '/core/folder/edit/',
            data, content_type='application/json',
            **{"HTTP_AUTHORIZATION": "Token testuser2"})
        self.assertEqual(response.status_code, 400)

    def test_edit(self):
        """
            Test case to edit folder
        """
        data = '{"parent_id": "1","folder_old_name": "testFolder","folder_new_name": "testNewFolder"}'
        response = self.client.post(
            '/core/folder/edit/',
            data, content_type='application/json',
            **{"HTTP_AUTHORIZATION": "Token testuser1"})
        self.assertEqual(response.status_code, 200)
