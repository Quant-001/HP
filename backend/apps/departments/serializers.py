from rest_framework import serializers
from .models import Department

class DepartmentSerializer(serializers.ModelSerializer):
    staff_count = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = ['id', 'hospital', 'name', 'description', 'head_doctor', 'staff_count', 'created_at']
        read_only_fields = ['id', 'hospital', 'created_at']

    def get_staff_count(self, obj):
        return obj.hospital.staff.filter(department=obj).count()

    def validate(self, attrs):
        request = self.context.get('request')
        hospital = getattr(getattr(request, 'user', None), 'hospital', None)
        if hospital and self.instance is None:
            usage = hospital.subscription_usage
            limit = usage['departments']['limit']
            if limit is not None and usage['departments']['used'] >= limit:
                raise serializers.ValidationError('Department limit reached for the current subscription plan.')
        return attrs
