from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from apps.core.mixins import HospitalScopedMixin, make_role_permission
from .models import Patient
from .serializers import PatientSerializer

PatientAccess = make_role_permission('hospital_admin', 'doctor', 'receptionist')

class PatientViewSet(HospitalScopedMixin, viewsets.ModelViewSet):
    queryset = Patient.objects.select_related('hospital', 'registered_by')
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated, PatientAccess]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['gender', 'blood_group', 'status']
    search_fields = ['name', 'email', 'phone', 'patient_id']
    ordering_fields = ['name', 'created_at']

    def perform_create(self, serializer):
        serializer.save(
            hospital=self.request.user.hospital,
            registered_by=self.request.user
        )
