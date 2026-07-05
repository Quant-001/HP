from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from apps.core.mixins import HospitalScopedMixin, make_role_permission
from .models import Appointment
from .serializers import AppointmentSerializer

AppointmentAccess = make_role_permission('hospital_admin', 'doctor', 'receptionist')

class AppointmentViewSet(HospitalScopedMixin, viewsets.ModelViewSet):
    queryset = Appointment.objects.select_related('hospital', 'patient', 'doctor', 'department')
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated, AppointmentAccess]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'type', 'doctor', 'department', 'appointment_date']
    search_fields = ['patient__name', 'doctor__name']
    ordering_fields = ['appointment_date', 'appointment_time', 'created_at']

    def perform_create(self, serializer):
        serializer.save(
            hospital=self.request.user.hospital,
            created_by=self.request.user
        )
