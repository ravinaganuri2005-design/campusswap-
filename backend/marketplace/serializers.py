from rest_framework import serializers
from .models import Product, Favorite, CategoryChoices, ConditionChoices, ListingTypeChoices, StatusChoices
from accounts.serializers import PublicUserSerializer

class ProductListSerializer(serializers.ModelSerializer):
    seller_name = serializers.CharField(source='seller.full_name', read_only=True)
    seller_id = serializers.IntegerField(source='seller.id', read_only=True)
    is_favorited = serializers.SerializerMethodField()
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    condition_display = serializers.CharField(source='get_condition_display', read_only=True)
    listing_type_display = serializers.CharField(source='get_listing_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'title', 'description', 'category', 'category_display',
            'original_price', 'selling_price', 'condition', 'condition_display',
            'image', 'listing_type', 'listing_type_display', 'exchange_preference',
            'college_name', 'status', 'status_display', 'seller_id', 'seller_name',
            'is_favorited', 'created_at'
        ]

    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Favorite.objects.filter(user=request.user, product=obj).exists()
        return False

class ProductDetailSerializer(serializers.ModelSerializer):
    seller = PublicUserSerializer(read_only=True)
    is_favorited = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    condition_display = serializers.CharField(source='get_condition_display', read_only=True)
    listing_type_display = serializers.CharField(source='get_listing_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'title', 'description', 'category', 'category_display',
            'original_price', 'selling_price', 'condition', 'condition_display',
            'image', 'listing_type', 'listing_type_display', 'exchange_preference',
            'college_name', 'status', 'status_display', 'seller',
            'is_favorited', 'is_owner', 'created_at', 'updated_at'
        ]

    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Favorite.objects.filter(user=request.user, product=obj).exists()
        return False

    def get_is_owner(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.seller_id == request.user.id
        return False

class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            'id', 'title', 'description', 'category',
            'original_price', 'selling_price', 'condition',
            'image', 'listing_type', 'exchange_preference',
            'college_name'
        ]

    def validate_original_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Original price cannot be negative.")
        return value

    def validate_selling_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Selling price cannot be negative.")
        return value

    def validate(self, data):
        listing_type = data.get(
            'listing_type',
            getattr(self.instance, 'listing_type', ListingTypeChoices.SALE)
        )
        exchange_preference = data.get(
            'exchange_preference',
            getattr(self.instance, 'exchange_preference', '')
        )
        if listing_type == ListingTypeChoices.EXCHANGE and not exchange_preference:
            raise serializers.ValidationError({
                "exchange_preference": "Please describe what items or books you wish to receive in exchange."
            })
        if listing_type == ListingTypeChoices.DONATION:
            data['selling_price'] = 0
        return data

class ProductStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['status']

    def validate_status(self, value):
        if value not in StatusChoices.values:
            raise serializers.ValidationError("Invalid status choice.")
        return value

class FavoriteSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Favorite
        fields = ['id', 'product', 'product_id', 'created_at']

    def validate_product_id(self, value):
        if not Product.objects.filter(id=value).exists():
            raise serializers.ValidationError("Product does not exist.")
        return value

    def create(self, validated_data):
        user = self.context['request'].user
        product_id = validated_data['product_id']
        product = Product.objects.get(id=product_id)
        favorite, created = Favorite.objects.get_or_create(user=user, product=product)
        return favorite

class PriceSuggestionInputSerializer(serializers.Serializer):
    product_name = serializers.CharField(max_length=200, required=True)
    original_price = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=1, required=True)
    category = serializers.ChoiceField(choices=CategoryChoices.choices, required=True)
    condition = serializers.ChoiceField(choices=ConditionChoices.choices, required=True)
