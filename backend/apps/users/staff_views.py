"""Staff management views (scoped to hospital)."""

from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import User
from .serializers import UserSerializer, StaffCreateSerializer, StaffUpdateSerializer
from apps.core.mixins import HospitalScopedMixin, make_role_permission

AdminOnly = make_role_permission('hospital_admin', 'super_admin')


class StaffViewSet(HospitalScopedMixin, viewsets.ModelViewSet):
    """CRUD for hospital staff (users)."""
    permission_classes = [IsAuthenticated, AdminOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['role', 'department', 'is_active']
    search_fields = ['name', 'email', 'specialization']
    ordering_fields = ['name', 'created_at']

    def get_queryset(self):
        qs = User.objects.select_related('hospital', 'department')
        user = self.request.user
        if user.role == 'super_admin':
            return qs
        return qs.filter(hospital=user.hospital).exclude(role='super_admin')

    def get_serializer_class(self):
        if self.action == 'create':
            return StaffCreateSerializer
        if self.action in ['update', 'partial_update']:
            return StaffUpdateSerializer
        return UserSerializer

    def perform_create(self, serializer):
        serializer.save(hospital=self.request.user.hospital)
