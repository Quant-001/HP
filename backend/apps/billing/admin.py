from django.contrib import admin
from .models import Invoice


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ['invoice_number', 'patient', 'status', 'total', 'paid_amount', 'balance', 'due_date', 'hospital', 'created_at']
    list_filter = ['status', 'hospital', 'due_date', 'created_at']
    list_select_related = ['hospital', 'patient', 'appointment', 'created_by']
    search_fields = ['invoice_number', 'patient__name', 'patient__patient_id', 'patient__phone', 'hospital__name']
    autocomplete_fields = ['hospital', 'patient', 'appointment', 'created_by']
    readonly_fields = ['invoice_number', 'balance', 'created_at', 'updated_at']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    fieldsets = (
        ('Invoice', {'fields': ('hospital', 'patient', 'appointment', 'invoice_number', 'status', 'due_date')}),
        ('Amounts', {'fields': ('items', 'subtotal', 'tax_percent', 'tax_amount', 'discount', 'total', 'paid_amount', 'balance')}),
        ('Notes', {'fields': ('notes', 'created_by')}),
        ('Timeline', {'fields': ('created_at', 'updated_at')}),
    )
