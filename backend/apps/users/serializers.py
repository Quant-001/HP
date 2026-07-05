from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from apps.hospitals.models import Hospital
from apps.hospitals.serializers import HospitalSerializer


class RegisterSerializer(serializers.Serializer):
    """Register a new hospital + admin user."""
    # Hospital fields
    hospital_name = serializers.CharField(max_length=255)
    hospital_email = serializers.EmailField()
    hospital_phone = serializers.CharField(max_length=20, required=False)
    hospital_address = serializers.CharField(required=False)
    # Admin fields
    admin_name = serializers.CharField(max_length=255)
    admin_email = serializers.EmailField()
    password = serializers.CharField(min_length=6, write_only=True)

    def validate_admin_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Email already exists.')
        return value

    def validate_hospital_email(self, value):
        if Hospital.objects.filter(email=value).exists():
            raise serializers.ValidationError('Hospital already registered.')
        return value

    def create(self, validated_data):
        hospital = Hospital.objects.create(
            name=validated_data['hospital_name'],
            email=validated_data['hospital_email'],
            phone=validated_data.get('hospital_phone', ''),
            address=validated_data.get('hospital_address', ''),
            plan='trial',
            subscription_status='trial',
            total_beds=25,
        )
        admin = User.objects.create_user(
            email=validated_data['admin_email'],
            password=validated_data['password'],
            name=validated_data['admin_name'],
            role='hospital_admin',
            hospital=hospital,
        )
        return admin, hospital


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(email=data['email'], password=data['password'])
        if not user:
            raise serializers.ValidationError('Invalid credentials.')
        if not user.is_active:
            raise serializers.ValidationError('Account is disabled.')
        data['user'] = user
        return data


class UserSerializer(serializers.ModelSerializer):
    hospital_detail = HospitalSerializer(source='hospital', read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'name', 'role', 'phone', 'specialization',
            'department', 'hospital', 'hospital_detail', 'avatar',
            'is_active', 'created_at',
        ]
        read_only_fields = ['id', 'created_at', 'hospital']


class StaffCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['email', 'name', 'role', 'phone', 'specialization', 'department', 'password']

    def validate(self, attrs):
        request = self.context.get('request')
        hospital = getattr(getattr(request, 'user', None), 'hospital', None)
        if not hospital:
            return attrs

        role = attrs.get('role')
        if role not in hospital.allowed_roles:
            raise serializers.ValidationError({
                'role': f'{role} is not available on the {hospital.plan_config["label"]} plan.'
            })

        usage = hospital.subscription_usage
        if usage['staff']['limit'] is not None and usage['staff']['used'] >= usage['staff']['limit']:
            raise serializers.ValidationError('Staff limit reached for the current subscription plan.')
        if role == 'doctor' and usage['doctors']['limit'] is not None and usage['doctors']['used'] >= usage['doctors']['limit']:
            raise serializers.ValidationError('Doctor limit reached for the current subscription plan.')
        return attrs

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class StaffUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['name', 'role', 'phone', 'specialization', 'department', 'is_active']

    def validate(self, attrs):
        request = self.context.get('request')
        hospital = getattr(getattr(request, 'user', None), 'hospital', None)
        role = attrs.get('role', getattr(self.instance, 'role', None))
        if hospital and role not in hospital.allowed_roles:
            raise serializers.ValidationError({
                'role': f'{role} is not available on the {hospital.plan_config["label"]} plan.'
            })
        if hospital and self.instance and self.instance.role != 'doctor' and role == 'doctor':
            usage = hospital.subscription_usage
            if usage['doctors']['limit'] is not None and usage['doctors']['used'] >= usage['doctors']['limit']:
                raise serializers.ValidationError('Doctor limit reached for the current subscription plan.')
        return attrs


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }
