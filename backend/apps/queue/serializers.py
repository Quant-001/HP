from rest_framework import serializers
from .models import QueueTicket


class QueueTicketSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.name', read_only=True)
    patient_id_str = serializers.CharField(source='patient.patient_id', read_only=True)
    doctor_name = serializers.CharField(source='doctor.name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = QueueTicket
        fields = '__all__'
        read_only_fields = [
            'id', 'hospital', 'token_number', 'called_at', 'completed_at',
            'created_by', 'created_at', 'updated_at',
        ]
