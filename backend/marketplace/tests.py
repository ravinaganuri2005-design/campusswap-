from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from marketplace.models import Product, Favorite, CategoryChoices, ConditionChoices, ListingTypeChoices, StatusChoices
from messaging.models import Enquiry, Message

User = get_user_model()

class MarketplaceAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.seller = User.objects.create_user(
            email='seller@campus.edu',
            password='Password123',
            full_name='Seller User'
        )
        self.buyer = User.objects.create_user(
            email='buyer@campus.edu',
            password='Password123',
            full_name='Buyer User'
        )
        self.product = Product.objects.create(
            seller=self.seller,
            title='Electronics Handbook',
            description='Second edition reference guide.',
            category=CategoryChoices.BOOKS_NOTES,
            original_price=600.00,
            selling_price=200.00,
            condition=ConditionChoices.GOOD,
            listing_type=ListingTypeChoices.SALE,
            college_name='Campus University'
        )

    def test_product_list_public(self):
        response = self.client.get('/api/products/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check paginated results
        self.assertIn('results', response.data)
        self.assertGreaterEqual(len(response.data['results']), 1)

    def test_product_create_authenticated(self):
        self.client.force_authenticate(user=self.seller)
        data = {
            'title': 'Scientific Calculator fx-991',
            'description': 'Working condition.',
            'category': CategoryChoices.ACADEMIC_EQUIPMENT,
            'original_price': 1200.00,
            'selling_price': 400.00,
            'condition': ConditionChoices.LIKE_NEW,
            'listing_type': ListingTypeChoices.SALE,
            'college_name': 'Campus University'
        }
        response = self.client.post('/api/products/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Scientific Calculator fx-991')

    def test_product_update_permission(self):
        # Buyer should NOT be able to modify seller's product
        self.client.force_authenticate(user=self.buyer)
        patch_data = {'title': 'Hacked Title'}
        response = self.client.put(f'/api/products/{self.product.id}/', patch_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Seller SHOULD be able to modify
        self.client.force_authenticate(user=self.seller)
        valid_update = {
            'title': 'Electronics Handbook Updated',
            'description': 'Updated description',
            'category': CategoryChoices.BOOKS_NOTES,
            'original_price': 600.00,
            'selling_price': 180.00,
            'condition': ConditionChoices.GOOD,
            'listing_type': ListingTypeChoices.SALE
        }
        response = self.client.put(f'/api/products/{self.product.id}/', valid_update, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.product.refresh_from_db()
        self.assertEqual(self.product.title, 'Electronics Handbook Updated')

    def test_product_status_patch(self):
        self.client.force_authenticate(user=self.seller)
        response = self.client.patch(f'/api/products/{self.product.id}/status/', {'status': 'sold'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.product.refresh_from_db()
        self.assertEqual(self.product.status, StatusChoices.SOLD)

    def test_favorites_workflow(self):
        self.client.force_authenticate(user=self.buyer)
        # Add favorite
        response = self.client.post('/api/favorites/', {'product_id': self.product.id}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Check in favorites list
        list_resp = self.client.get('/api/favorites/')
        self.assertEqual(list_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_resp.data['results']), 1)

        # Remove favorite
        del_resp = self.client.delete(f'/api/favorites/{self.product.id}/')
        self.assertEqual(del_resp.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Favorite.objects.filter(user=self.buyer, product=self.product).exists())

    def test_ai_price_suggestion(self):
        data = {
            'product_name': 'Engineering Mathematics',
            'original_price': 1000.00,
            'category': 'books_notes',
            'condition': 'like_new'
        }
        response = self.client.post('/api/price-suggestion/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('suggested_min_price', response.data)
        self.assertIn('suggested_max_price', response.data)
        self.assertIn('explanation', response.data)
        # Like new books multiplier ~70%-85% * 1.05
        self.assertGreaterEqual(response.data['suggested_min_price'], 700)
        self.assertLessEqual(response.data['suggested_max_price'], 950)

    def test_messaging_flow(self):
        # Buyer initiates enquiry
        self.client.force_authenticate(user=self.buyer)
        enquiry_data = {
            'product_id': self.product.id,
            'subject': 'Price negotiation',
            'message': 'Would you accept ₹180 for this book?'
        }
        response = self.client.post('/api/messages/', enquiry_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        enquiry_id = response.data['id']

        # Seller views incoming enquiries
        self.client.force_authenticate(user=self.seller)
        msg_resp = self.client.get('/api/messages/?type=received')
        self.assertEqual(msg_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(msg_resp.data), 1)

        # Seller replies
        reply_data = {
            'enquiry_id': enquiry_id,
            'body': 'Yes, ₹180 is fine. Let us meet at the canteen.'
        }
        reply_resp = self.client.post('/api/messages/', reply_data, format='json')
        self.assertEqual(reply_resp.status_code, status.HTTP_201_CREATED)

        # Cannot message self
        self_data = {
            'product_id': self.product.id,
            'message': 'Messaging my own item.'
        }
        self_resp = self.client.post('/api/messages/', self_data, format='json')
        self.assertEqual(self_resp.status_code, status.HTTP_400_BAD_REQUEST)
