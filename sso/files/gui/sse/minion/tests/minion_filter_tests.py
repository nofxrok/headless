"""
    unit test cases for minion Filter
"""
from django.test import TestCase
from django.test import Client
from django.contrib.auth.models import User
from core.models import GlobalConfig, MinionFilter
from rest_framework.authtoken.models import Token


class MinionSaveFilterTest(TestCase):
    """
        Usage: python3 manage.py test minion.tests
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
            value="60")
        self.filter_obj = MinionFilter.objects.create(
            search_type=1,
            match_parameters=1,
            search_field=4,
            search_text="127.0.0.1",
            user=self.user_obj,
            filter_name="test_filter"
        )

    def tearDown(self):
        User.objects.all().delete()
        MinionFilter.objects.all().delete()

    def test_filter_name_empty(self):
        """
            Test case for empty filter name
        """
        self.parameters = '{"filter_name":"","match_params": 1,"search_field": 4,\
                        "search_text":"127.0.0.1","search_type" : 1}'
        response = self.c.post('/minion/filter/save/', self.parameters,
                               content_type="application/json",
                               **{"HTTP_AUTHORIZATION": "Token testuser1"})
        self.assertEqual(response.status_code, 400)

    def test_filter_name(self):
        """
            Test case for filter name
        """
        self.parameters = '{"filter_name":"test_filter_1","match_params": 1,\
                       "search_field": 4,"search_text":"127.0.0.1","search_type" : 1}'
        response = self.c.post('/minion/filter/save/', self.parameters,
                               content_type="application/json",
                               **{"HTTP_AUTHORIZATION": "Token testuser1"})
        self.assertEqual(response.status_code, 200)

    def test_filter_duplicate_name(self):
        """
            Test case for duplicate filter Name
        """
        self.parameters = '{"filter_name":"test_filter","match_params": 1,\
                        "search_field": 4,"search_text":"127.0.0.1","search_type" : 1}'
        response = self.c.post('/minion/filter/save/', self.parameters,
                               content_type="application/json",
                               **{"HTTP_AUTHORIZATION": "Token testuser1"})
        self.assertEqual(response.status_code, 400)

    def test_filter_search_text_empty(self):
        """
            Test case for empty filter search text
        """
        self.parameters = '{"filter_name":"test_filter_2","match_params": 1,\
                        "search_field": 4,"search_text":"","search_type" : 1}'
        response = self.c.post('/minion/filter/save/', self.parameters,
                               content_type="application/json",
                               **{"HTTP_AUTHORIZATION": "Token testuser1"})
        self.assertEqual(response.status_code, 400)

class MinionFilterListTest(TestCase):
    """
        Usage: python3 manage.py test minion.tests
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
            value="60")

    def tearDown(self):
        User.objects.all().delete()

    def test_filter_list(self):
        """
            Test case for saved minion list
        """
        response = self.c.get('/minion/filter/list/',
                               content_type="application/json",
                               **{"HTTP_AUTHORIZATION": "Token testuser1"})
        self.assertEqual(response.status_code, 200)
