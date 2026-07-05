from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from apps.core.mixins import HospitalScopedMixin, make_role_permission
from .models import MedicalRecord
from .serializers import MedicalRecordSerializer

MedicalRecordAccess = make_role_permission('hospital_admin', 'doctor')

class MedicalRecordViewSet(HospitalScopedMixin, viewsets.ModelViewSet):
    queryset = MedicalRecord.objects.select_related('hospital', 'patient', 'doctor', 'appointment')
    serializer_class = MedicalRecordSerializer
    permission_classes = [IsAuthenticated, MedicalRecordAccess]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['patient', 'doctor']
    search_fields = ['patient__name', 'diagnosis']

    def perform_create(self, serializer):
        serializer.save(hospital=self.request.user.hospital, doctor=self.request.user)
