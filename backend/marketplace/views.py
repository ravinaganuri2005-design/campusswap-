from rest_framework import generics, status, permissions, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from .models import Product, Favorite, StatusChoices
from .serializers import (
    ProductListSerializer,
    ProductDetailSerializer,
    ProductCreateUpdateSerializer,
    ProductStatusUpdateSerializer,
    FavoriteSerializer,
    PriceSuggestionInputSerializer
)
from .pricing_engine import calculate_fair_price

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.seller == request.user

class ProductListCreateView(generics.ListCreateAPIView):
    serializer_class = ProductListSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        queryset = Product.objects.select_related('seller', 'seller__profile').all()

        # Search parameter
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )

        # Category filter
        category = self.request.query_params.get('category')
        if category and category != 'all':
            queryset = queryset.filter(category=category)

        # Condition filter
        condition = self.request.query_params.get('condition')
        if condition and condition != 'all':
            queryset = queryset.filter(condition=condition)

        # Listing Type filter (sale, exchange, donation)
        listing_type = self.request.query_params.get('listing_type')
        if listing_type and listing_type != 'all':
            queryset = queryset.filter(listing_type=listing_type)

        # College filter
        college = self.request.query_params.get('college')
        if college:
            queryset = queryset.filter(college_name__icontains=college)

        # Status filter (default to active for public browsing unless specified)
        status_param = self.request.query_params.get('status')
        if status_param and status_param != 'all':
            queryset = queryset.filter(status=status_param)
        elif not status_param:
            queryset = queryset.filter(status=StatusChoices.ACTIVE)

        # Price range filter
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            try:
                queryset = queryset.filter(selling_price__gte=float(min_price))
            except ValueError:
                pass
        if max_price:
            try:
                queryset = queryset.filter(selling_price__lte=float(max_price))
            except ValueError:
                pass

        # Sorting
        sort = self.request.query_params.get('sort', 'recent')
        if sort == 'price_asc':
            queryset = queryset.order_by('selling_price')
        elif sort == 'price_desc':
            queryset = queryset.order_by('-selling_price')
        else:
            queryset = queryset.order_by('-created_at')

        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        college_name = self.request.data.get('college_name')
        if not college_name and hasattr(user, 'profile') and user.profile.college_name:
            college_name = user.profile.college_name
        serializer.save(seller=user, college_name=college_name)

    def create(self, request, *args, **kwargs):
        create_serializer = ProductCreateUpdateSerializer(data=request.data, context={'request': request})
        if create_serializer.is_valid():
            self.perform_create(create_serializer)
            instance = create_serializer.instance
            detail_serializer = ProductDetailSerializer(instance, context={'request': request})
            return Response(detail_serializer.data, status=status.HTTP_201_CREATED)
        return Response(create_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.select_related('seller', 'seller__profile').all()
    permission_classes = [IsOwnerOrReadOnly]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ProductCreateUpdateSerializer
        return ProductDetailSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = ProductCreateUpdateSerializer(instance, data=request.data, partial=partial, context={'request': request})
        if serializer.is_valid():
            self.perform_update(serializer)
            detail_serializer = ProductDetailSerializer(serializer.instance, context={'request': request})
            return Response(detail_serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProductStatusUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

        if product.seller != request.user:
            return Response({"error": "You do not have permission to modify this product."}, status=status.HTTP_403_FORBIDDEN)

        serializer = ProductStatusUpdateSerializer(product, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(ProductDetailSerializer(product, context={'request': request}).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MyListingsView(generics.ListAPIView):
    serializer_class = ProductListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Product.objects.filter(seller=self.request.user)
        status_filter = self.request.query_params.get('status')
        if status_filter and status_filter != 'all':
            queryset = queryset.filter(status=status_filter)
        return queryset

class FavoriteListCreateView(generics.ListCreateAPIView):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user).select_related('product', 'product__seller')

class FavoriteDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        # Support deletion by favorite ID or by product ID
        favorite = Favorite.objects.filter(user=request.user).filter(Q(id=pk) | Q(product_id=pk)).first()
        if not favorite:
            return Response({"error": "Favorite record not found."}, status=status.HTTP_404_NOT_FOUND)
        favorite.delete()
        return Response({"message": "Product removed from favorites."}, status=status.HTTP_204_NO_CONTENT)

class PriceSuggestionView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PriceSuggestionInputSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            result = calculate_fair_price(
                product_name=data['product_name'],
                original_price=data['original_price'],
                category=data['category'],
                condition=data['condition']
            )
            return Response(result, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
