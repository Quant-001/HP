from rest_framework import serializers
from .models import Patient

class PatientSerializer(serializers.ModelSerializer):
    age = serializers.ReadOnlyField()

    class Meta:
        model = Patient
        fields = '__all__'
        read_only_fields = ['id', 'patient_id', 'hospital', 'registered_by', 'created_at', 'updated_at']
