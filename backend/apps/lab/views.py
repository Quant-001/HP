from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from apps.core.mixins import HospitalScopedMixin, make_plan_permission, make_role_permission
from .models import LabTest
from .serializers import LabTestSerializer

LabAccess = make_plan_permission('advanced', 'enterprise')
LabRoleAccess = make_role_permission('hospital_admin', 'doctor', 'lab_technician')

class LabTestViewSet(HospitalScopedMixin, viewsets.ModelViewSet):
    queryset = LabTest.objects.select_related('hospital', 'patient', 'ordered_by')
    serializer_class = LabTestSerializer
    permission_classes = [IsAuthenticated, LabAccess, LabRoleAccess]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['status', 'patient', 'category']
    search_fields = ['test_name', 'patient__name', 'test_code']

    def perform_create(self, serializer):
        serializer.save(hospital=self.request.user.hospital, ordered_by=self.request.user)
