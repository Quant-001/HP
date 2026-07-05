from django.contrib import admin
from .models import LabTest


@admin.register(LabTest)
class LabTestAdmin(admin.ModelAdmin):
    list_display = ['test_name', 'test_code', 'patient', 'category', 'status', 'cost', 'result_date', 'hospital', 'created_at']
    list_filter = ['status', 'category', 'hospital', 'result_date', 'created_at']
    list_select_related = ['hospital', 'patient', 'appointment', 'ordered_by', 'processed_by']
    search_fields = ['test_name', 'test_code', 'category', 'patient__name', 'patient__patient_id', 'ordered_by__name', 'processed_by__name']
    autocomplete_fields = ['hospital', 'patient', 'appointment', 'ordered_by', 'processed_by']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    fieldsets = (
        ('Test', {'fields': ('hospital', 'patient', 'appointment', 'test_name', 'test_code', 'category', 'cost')}),
        ('Workflow', {'fields': ('status', 'ordered_by', 'processed_by', 'result_date')}),
        ('Result', {'fields': ('result', 'normal_range', 'notes')}),
        ('Timeline', {'fields': ('created_at', 'updated_at')}),
    )
