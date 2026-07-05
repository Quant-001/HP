from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'name', 'role', 'hospital', 'phone', 'is_active', 'created_at']
    list_filter = ['role', 'is_active', 'hospital', 'created_at']
    list_select_related = ['hospital', 'department']
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal', {'fields': ('name', 'phone', 'role', 'hospital', 'department', 'specialization')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
        ('Important dates', {'fields': ('last_login', 'created_at', 'updated_at')}),
    )
    add_fieldsets = (
        (None, {'classes': ('wide',), 'fields': ('email', 'name', 'password1', 'password2', 'role', 'hospital')}),
    )
    search_fields = ['email', 'name', 'phone', 'hospital__name', 'department__name']
    autocomplete_fields = ['hospital', 'department']
    readonly_fields = ['last_login', 'created_at', 'updated_at']
    date_hierarchy = 'created_at'
    ordering = ['hospital__name', 'email']

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.filter(role__in=['super_admin', 'hospital_admin'])
