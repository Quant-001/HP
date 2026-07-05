"""
Core mixins and base classes for Hospora multi-tenancy.
Every queryset is automatically scoped to the user's hospital.
"""

from rest_framework import permissions
from rest_framework.exceptions import PermissionDenied


class HospitalScopedMixin:
    """
    Mixin that automatically scopes querysets to the user's hospital.
    Include in all ViewSets that deal with hospital-specific data.
    """

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.is_authenticated:
            if user.role == 'super_admin':
                return qs  # Super admin sees all
            if hasattr(user, 'hospital') and user.hospital:
                return qs.filter(hospital=user.hospital)
        return qs.none()

    def perform_create(self, serializer):
        """Auto-assign hospital on create."""
        user = self.request.user
        if user.role != 'super_admin' and user.hospital:
            serializer.save(hospital=user.hospital)
        else:
            serializer.save()


class RolePermission(permissions.BasePermission):
    """Dynamic role-based permission checker."""
    allowed_roles = []

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.user.role == 'super_admin':
            return True
        return request.user.role in self.allowed_roles


def make_role_permission(*roles):
    """Factory to create role permission classes."""
    class DynamicRolePermission(RolePermission):
        allowed_roles = list(roles)
    return DynamicRolePermission


class PlanFeaturePermission(permissions.BasePermission):
    """Checks if hospital plan allows a specific feature."""
    required_plans = ['basic', 'advanced', 'enterprise']

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.user.role == 'super_admin':
            return True
        hospital = request.user.hospital
        if not hospital:
            return False
        return hospital.plan in self.required_plans


def make_plan_permission(*plans):
    """Factory to create plan permission classes."""
    class DynamicPlanPermission(PlanFeaturePermission):
        required_plans = list(plans)
    return DynamicPlanPermission
