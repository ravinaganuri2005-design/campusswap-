from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from .models import StudentProfile

User = get_user_model()

class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = ['college_name', 'phone_number', 'bio', 'year_of_study', 'avatar', 'created_at', 'updated_at']

class UserSerializer(serializers.ModelSerializer):
    profile = StudentProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'is_staff', 'date_joined', 'profile']
        read_only_fields = ['id', 'email', 'is_staff', 'date_joined']

class PublicUserSerializer(serializers.ModelSerializer):
    college_name = serializers.CharField(source='profile.college_name', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'full_name', 'college_name']

class RegisterSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=150, required=True)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, min_length=6, required=True)
    confirm_password = serializers.CharField(write_only=True, min_length=6, required=True)
    college_name = serializers.CharField(max_length=200, required=True)

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value.lower()

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        college_name = validated_data.pop('college_name')
        
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            full_name=validated_data['full_name']
        )
        StudentProfile.objects.create(
            user=user,
            college_name=college_name
        )
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        # Return user details in the login response
        profile = getattr(self.user, 'profile', None)
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'full_name': self.user.full_name,
            'is_staff': self.user.is_staff,
            'college_name': profile.college_name if profile else '',
            'phone_number': profile.phone_number if profile else '',
            'bio': profile.bio if profile else '',
            'year_of_study': profile.year_of_study if profile else '',
        }
        return data
