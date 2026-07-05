from django.contrib import admin
from .models import Hospital


@admin.register(Hospital)
class HospitalAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'owner_name', 'owner_email', 'email', 'phone',
        'plan', 'subscription_status', 'owner_count', 'created_at',
    ]
    list_filter = ['plan', 'subscription_status', 'country', 'created_at']
    search_fields = [
        'name', 'email', 'phone', 'city', 'country',
        'staff__name', 'staff__email', 'staff__phone',
    ]
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'
    ordering = ['name']
    fieldsets = (
        ('Hospital', {'fields': ('name', 'email', 'phone', 'address', 'city', 'country', 'logo')}),
        ('Subscription', {'fields': ('plan', 'subscription_status', 'total_beds')}),
        ('Timeline', {'fields': ('created_at', 'updated_at')}),
    )

    @admin.display(description='Owner name')
    def owner_name(self, obj):
        owner = obj.staff.filter(role='hospital_admin').order_by('created_at').first()
        return owner.name if owner else '-'

    @admin.display(description='Owner email')
    def owner_email(self, obj):
        owner = obj.staff.filter(role='hospital_admin').order_by('created_at').first()
        return owner.email if owner else '-'

    @admin.display(description='Owners')
    def owner_count(self, obj):
        return obj.staff.filter(role='hospital_admin').count()
