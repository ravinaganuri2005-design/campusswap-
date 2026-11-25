from rest_framework import serializers
from .models import Enquiry, Message, EnquiryStatus
from marketplace.models import Product, StatusChoices

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.full_name', read_only=True)
    sender_id = serializers.IntegerField(source='sender.id', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'enquiry', 'sender_id', 'sender_name', 'body', 'is_read', 'created_at']
        read_only_fields = ['id', 'enquiry', 'sender_id', 'sender_name', 'is_read', 'created_at']

class EnquiryListSerializer(serializers.ModelSerializer):
    buyer_name = serializers.CharField(source='buyer.full_name', read_only=True)
    buyer_college = serializers.CharField(source='buyer.profile.college_name', default='', read_only=True)
    seller_name = serializers.CharField(source='seller.full_name', read_only=True)
    seller_college = serializers.CharField(source='seller.profile.college_name', default='', read_only=True)
    product_title = serializers.CharField(source='product.title', read_only=True)
    product_price = serializers.DecimalField(source='product.selling_price', max_digits=10, decimal_places=2, read_only=True)
    product_image = serializers.ImageField(source='product.image', read_only=True)
    product_status = serializers.CharField(source='product.status', read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Enquiry
        fields = [
            'id', 'product', 'product_title', 'product_price', 'product_image', 'product_status',
            'buyer', 'buyer_name', 'buyer_college',
            'seller', 'seller_name', 'seller_college',
            'subject', 'status', 'last_message', 'unread_count',
            'created_at', 'updated_at'
        ]

    def get_last_message(self, obj):
        msg = obj.messages.last()
        if msg:
            return {
                'body': msg.body,
                'sender_id': msg.sender_id,
                'sender_name': msg.sender.full_name,
                'created_at': msg.created_at
            }
        return None

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.messages.filter(is_read=False).exclude(sender=request.user).count()
        return 0

class EnquiryDetailSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    buyer_name = serializers.CharField(source='buyer.full_name', read_only=True)
    buyer_college = serializers.CharField(source='buyer.profile.college_name', default='', read_only=True)
    seller_name = serializers.CharField(source='seller.full_name', read_only=True)
    seller_college = serializers.CharField(source='seller.profile.college_name', default='', read_only=True)
    product_title = serializers.CharField(source='product.title', read_only=True)
    product_price = serializers.DecimalField(source='product.selling_price', max_digits=10, decimal_places=2, read_only=True)
    product_image = serializers.ImageField(source='product.image', read_only=True)
    product_status = serializers.CharField(source='product.status', read_only=True)

    class Meta:
        model = Enquiry
        fields = [
            'id', 'product', 'product_title', 'product_price', 'product_image', 'product_status',
            'buyer', 'buyer_name', 'buyer_college',
            'seller', 'seller_name', 'seller_college',
            'subject', 'status', 'messages', 'created_at', 'updated_at'
        ]

class CreateEnquirySerializer(serializers.Serializer):
    product_id = serializers.IntegerField(required=True)
    subject = serializers.CharField(max_length=200, required=False, allow_blank=True)
    message = serializers.CharField(required=True)

    def validate_product_id(self, value):
        try:
            product = Product.objects.get(id=value)
        except Product.DoesNotExist:
            raise serializers.ValidationError("Product does not exist.")

        if product.status != StatusChoices.ACTIVE:
            raise serializers.ValidationError("Enquiries cannot be sent for sold or unavailable products.")

        user = self.context['request'].user
        if product.seller == user:
            raise serializers.ValidationError("You cannot message yourself about your own product listing.")

        return value

class CreateReplySerializer(serializers.Serializer):
    enquiry_id = serializers.IntegerField(required=True)
    body = serializers.CharField(required=True)

    def validate_enquiry_id(self, value):
        try:
            enquiry = Enquiry.objects.get(id=value)
        except Enquiry.DoesNotExist:
            raise serializers.ValidationError("Enquiry thread not found.")

        user = self.context['request'].user
        if user != enquiry.buyer and user != enquiry.seller:
            raise serializers.ValidationError("You do not have access to this enquiry conversation.")

        return value
