from django.contrib import admin
from .models import Department


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'hospital', 'head_doctor', 'created_at']
    list_filter = ['hospital', 'created_at']
    list_select_related = ['hospital', 'head_doctor']
    search_fields = ['name', 'description', 'hospital__name', 'head_doctor__name', 'head_doctor__email']
    autocomplete_fields = ['hospital', 'head_doctor']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'
    ordering = ['hospital__name', 'name']
