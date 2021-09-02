import json

from django.test import Client, TestCase

from .models import User, Post
from .views import query_posts, compose

# Create your tests here.
class PostTestCase(TestCase):

    def setUp(self):

        # Create a user and login
        self.user = User.objects.create_user(username='testuser', password='12345')
        login = self.client.login(username='testuser', password='12345')


    def test_compose_not_post(self):
        """ check for status 400 on get """

        response = self.client.get("/posts")
        self.assertEqual(response.status_code, 400)


    def test_compose_success(self):
        """ Check for code 201 on correct post submission."""

        data = {
            "body": "foo",
        }

        response = self.client.post("/posts", json.dumps(data), content_type="application/json")
        #print(f'response = {response}')
        #print(response.content)
        self.assertEqual(response.status_code, 201)


    def test_query_posts(self):
        """ check returned json contains expected body """

        data = {
            "body": "foo",
        }

        response = self.client.post("/posts", json.dumps(data), content_type="application/json")

        response = self.client.get("/posts/all")
        json_data = json.loads(response.content)
        print(response.content)
        self.assertEqual(json_data[0]['body'], 'foo')
