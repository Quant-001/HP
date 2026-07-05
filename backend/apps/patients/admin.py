from django.contrib import admin
from .models import Patient


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ['patient_id', 'name', 'phone', 'gender', 'age', 'blood_group', 'status', 'hospital', 'created_at']
    list_filter = ['status', 'gender', 'blood_group', 'hospital', 'created_at']
    list_select_related = ['hospital', 'registered_by']
    search_fields = ['patient_id', 'name', 'email', 'phone', 'emergency_contact', 'emergency_phone', 'hospital__name']
    autocomplete_fields = ['hospital', 'registered_by']
    readonly_fields = ['patient_id', 'age', 'created_at', 'updated_at']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    fieldsets = (
        ('Patient', {'fields': ('hospital', 'patient_id', 'name', 'email', 'phone', 'date_of_birth', 'age', 'gender', 'blood_group', 'status')}),
        ('Contact', {'fields': ('address', 'emergency_contact', 'emergency_phone')}),
        ('Medical background', {'fields': ('allergies', 'chronic_conditions')}),
        ('Registration', {'fields': ('registered_by', 'created_at', 'updated_at')}),
    )
