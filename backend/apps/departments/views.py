from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from apps.core.mixins import HospitalScopedMixin, make_role_permission
from .models import Department
from .serializers import DepartmentSerializer

DepartmentAccess = make_role_permission('hospital_admin', 'super_admin')

class DepartmentViewSet(HospitalScopedMixin, viewsets.ModelViewSet):
    queryset = Department.objects.select_related('hospital', 'head_doctor')
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated, DepartmentAccess]
    search_fields = ['name']
    filter_backends = [filters.SearchFilter]
