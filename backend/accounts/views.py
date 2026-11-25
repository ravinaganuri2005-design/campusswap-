from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .serializers import (
    RegisterSerializer,
    CustomTokenObtainPairSerializer,
    UserSerializer,
    StudentProfileSerializer,
)
from .models import StudentProfile

User = get_user_model()

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            profile = getattr(user, 'profile', None)
            return Response({
                'message': 'Registration successful! Welcome to CampusSwap.',
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                },
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'full_name': user.full_name,
                    'college_name': profile.college_name if profile else '',
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]
    serializer_class = CustomTokenObtainPairSerializer

class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        user = request.user
        full_name = request.data.get('full_name')
        if full_name:
            user.full_name = full_name
            user.save()

        profile, _ = StudentProfile.objects.get_or_create(user=user)
        serializer = StudentProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(UserSerializer(user).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class StudentDashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        active_listings = user.products.filter(status='active').count()
        sold_listings = user.products.filter(status='sold').count()
        total_listings = user.products.count()
        favorites_count = user.favorites.count()
        received_enquiries = user.received_enquiries.count()
        sent_enquiries = user.sent_enquiries.count()

        return Response({
            'active_listings': active_listings,
            'sold_listings': sold_listings,
            'total_listings': total_listings,
            'favorites_count': favorites_count,
            'received_enquiries': received_enquiries,
            'sent_enquiries': sent_enquiries,
        })

class AdminOverviewView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        from marketplace.models import Product
        from messaging.models import Enquiry
        from django.db.models import Sum

        total_users = User.objects.count()
        total_products = Product.objects.count()
        active_products = Product.objects.filter(status='active').count()
        sold_products = Product.objects.filter(status='sold').count()
        total_enquiries = Enquiry.objects.count()
        total_value = Product.objects.aggregate(total=Sum('selling_price'))['total'] or 0

        users_list = []
        for u in User.objects.select_related('profile').all().order_by('-date_joined'):
            users_list.append({
                'id': u.id,
                'email': u.email,
                'full_name': u.full_name,
                'college_name': u.profile.college_name if hasattr(u, 'profile') else '',
                'is_staff': u.is_staff,
                'date_joined': u.date_joined.strftime('%Y-%m-%d'),
                'listings_count': u.products.count(),
            })

        products_list = []
        for p in Product.objects.select_related('seller').all().order_by('-created_at'):
            products_list.append({
                'id': p.id,
                'title': p.title,
                'category_display': p.get_category_display(),
                'selling_price': float(p.selling_price),
                'condition_display': p.get_condition_display(),
                'listing_type_display': p.get_listing_type_display(),
                'status': p.status,
                'college_name': p.college_name,
                'seller_name': p.seller.full_name,
                'seller_email': p.seller.email,
                'created_at': p.created_at.strftime('%Y-%m-%d'),
            })

        return Response({
            'stats': {
                'total_users': total_users,
                'total_products': total_products,
                'active_products': active_products,
                'sold_products': sold_products,
                'total_enquiries': total_enquiries,
                'total_value': float(total_value),
            },
            'users': users_list,
            'products': products_list,
        })
