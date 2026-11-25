from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()

class AccountsAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = '/api/accounts/register/'
        self.login_url = '/api/accounts/login/'
        self.profile_url = '/api/accounts/profile/'

    def test_student_registration(self):
        data = {
            'full_name': 'Test Student',
            'email': 'student@college.edu',
            'password': 'SecurePassword@123',
            'confirm_password': 'SecurePassword@123',
            'college_name': 'Test Engineering College'
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', response.data)
        self.assertIn('access', response.data['tokens'])
        self.assertTrue(User.objects.filter(email='student@college.edu').exists())

    def test_registration_password_mismatch(self):
        data = {
            'full_name': 'Test Student',
            'email': 'student2@college.edu',
            'password': 'Password123',
            'confirm_password': 'DifferentPassword',
            'college_name': 'Test College'
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_student_login(self):
        user = User.objects.create_user(
            email='loginuser@college.edu',
            password='MyPassword123',
            full_name='Login Student'
        )
        data = {
            'email': 'loginuser@college.edu',
            'password': 'MyPassword123'
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['email'], 'loginuser@college.edu')

    def test_profile_update(self):
        user = User.objects.create_user(
            email='profileuser@college.edu',
            password='MyPassword123',
            full_name='Profile Student'
        )
        self.client.force_authenticate(user=user)
        update_data = {
            'full_name': 'Updated Student Name',
            'bio': 'Passionate about open source hardware.',
            'year_of_study': '3rd Year'
        }
        response = self.client.put(self.profile_url, update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertEqual(user.full_name, 'Updated Student Name')
        self.assertEqual(user.profile.bio, 'Passionate about open source hardware.')
