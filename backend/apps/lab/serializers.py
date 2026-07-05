from rest_framework import serializers
from .models import LabTest

class LabTestSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.name', read_only=True)
    ordered_by_name = serializers.CharField(source='ordered_by.name', read_only=True)

    class Meta:
        model = LabTest
        fields = '__all__'
        read_only_fields = ['id', 'hospital', 'ordered_by', 'created_at', 'updated_at']
