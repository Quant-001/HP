from rest_framework import serializers
from .models import Medicine

class MedicineSerializer(serializers.ModelSerializer):
    is_low_stock = serializers.ReadOnlyField()

    class Meta:
        model = Medicine
        fields = '__all__'
        read_only_fields = ['id', 'hospital', 'created_at', 'updated_at']
