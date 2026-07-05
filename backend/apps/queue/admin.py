from django.contrib import admin
from .models import QueueTicket


@admin.register(QueueTicket)
class QueueTicketAdmin(admin.ModelAdmin):
    list_display = ['token_number', 'patient', 'doctor', 'department', 'status', 'priority', 'queue_date', 'hospital', 'created_at']
    list_filter = ['status', 'priority', 'queue_date', 'department', 'hospital']
    list_select_related = ['hospital', 'patient', 'appointment', 'doctor', 'department', 'created_by']
    search_fields = ['patient__name', 'patient__patient_id', 'patient__phone', 'doctor__name', 'department__name', 'visit_reason']
    autocomplete_fields = ['hospital', 'patient', 'appointment', 'doctor', 'department', 'created_by']
    readonly_fields = ['token_number', 'called_at', 'completed_at', 'created_at', 'updated_at']
    date_hierarchy = 'queue_date'
    ordering = ['-queue_date', 'token_number']
    fieldsets = (
        ('Queue', {'fields': ('hospital', 'queue_date', 'token_number', 'priority', 'status')}),
        ('Visit', {'fields': ('patient', 'appointment', 'doctor', 'department', 'visit_reason', 'notes')}),
        ('Timing', {'fields': ('called_at', 'completed_at', 'created_by', 'created_at', 'updated_at')}),
    )
