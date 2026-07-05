from django.contrib import admin
from .models import Appointment


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = [
        'patient', 'doctor', 'department', 'appointment_date',
        'appointment_time', 'type', 'status', 'hospital',
    ]
    list_filter = ['status', 'type', 'department', 'hospital', 'appointment_date']
    list_select_related = ['hospital', 'patient', 'doctor', 'department', 'created_by']
    search_fields = [
        'patient__name', 'patient__patient_id', 'patient__phone',
        'doctor__name', 'doctor__email', 'department__name', 'reason',
    ]
    autocomplete_fields = ['hospital', 'patient', 'doctor', 'department', 'created_by']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'appointment_date'
    ordering = ['-appointment_date', '-appointment_time']
    fieldsets = (
        ('Schedule', {'fields': ('hospital', 'patient', 'doctor', 'department', 'appointment_date', 'appointment_time', 'duration_minutes')}),
        ('Visit', {'fields': ('type', 'status', 'reason', 'notes')}),
        ('Audit', {'fields': ('created_by', 'created_at', 'updated_at')}),
    )
