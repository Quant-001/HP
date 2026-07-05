from django.contrib import admin
from .models import Medicine


@admin.register(Medicine)
class MedicineAdmin(admin.ModelAdmin):
    list_display = ['name', 'generic_name', 'category', 'manufacturer', 'stock', 'min_stock', 'unit_price', 'expiry_date', 'is_active', 'hospital']
    list_filter = ['category', 'is_active', 'hospital', 'expiry_date', 'created_at']
    list_select_related = ['hospital']
    search_fields = ['name', 'generic_name', 'manufacturer', 'hospital__name']
    autocomplete_fields = ['hospital']
    readonly_fields = ['is_low_stock', 'created_at', 'updated_at']
    date_hierarchy = 'created_at'
    ordering = ['name']
    fieldsets = (
        ('Medicine', {'fields': ('hospital', 'name', 'generic_name', 'category', 'manufacturer', 'description', 'is_active')}),
        ('Inventory', {'fields': ('stock', 'min_stock', 'is_low_stock', 'unit_price', 'expiry_date')}),
        ('Timeline', {'fields': ('created_at', 'updated_at')}),
    )
