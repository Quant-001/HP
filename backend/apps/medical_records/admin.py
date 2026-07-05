from django.contrib import admin
from .models import MedicalRecord


@admin.register(MedicalRecord)
class MedicalRecordAdmin(admin.ModelAdmin):
    list_display = ['patient', 'doctor', 'hospital', 'follow_up_date', 'created_at']
    list_filter = ['hospital', 'doctor', 'follow_up_date', 'created_at']
    list_select_related = ['hospital', 'patient', 'appointment', 'doctor']
    search_fields = ['patient__name', 'patient__patient_id', 'doctor__name', 'diagnosis', 'symptoms', 'treatment']
    autocomplete_fields = ['hospital', 'patient', 'appointment', 'doctor']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    fieldsets = (
        ('People', {'fields': ('hospital', 'patient', 'appointment', 'doctor')}),
        ('Clinical notes', {'fields': ('symptoms', 'diagnosis', 'treatment', 'prescription', 'notes', 'follow_up_date')}),
        ('Timeline', {'fields': ('created_at', 'updated_at')}),
    )
