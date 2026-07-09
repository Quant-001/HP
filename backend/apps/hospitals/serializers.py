from rest_framework import serializers
from .models import Hospital


class HospitalSerializer(serializers.ModelSerializer):
    has_pharmacy = serializers.ReadOnlyField()
    has_lab = serializers.ReadOnlyField()
    has_multi_branch = serializers.ReadOnlyField()
    has_bed_management = serializers.ReadOnlyField()
    has_inventory = serializers.ReadOnlyField()
    max_doctors = serializers.ReadOnlyField()
    plan_catalog = serializers.ReadOnlyField()
    plan_config = serializers.ReadOnlyField()
    plan_limits = serializers.ReadOnlyField()
    enabled_modules = serializers.ReadOnlyField()
    allowed_roles = serializers.ReadOnlyField()
    subscription_usage = serializers.ReadOnlyField()
    owner_name = serializers.SerializerMethodField()
    owner_email = serializers.SerializerMethodField()
    owner_count = serializers.SerializerMethodField()
    staff_count = serializers.SerializerMethodField()

    class Meta:
        model = Hospital
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

    def get_owner(self, obj):
        return obj.staff.filter(role='hospital_admin').order_by('created_at').first()

    def get_owner_name(self, obj):
        owner = self.get_owner(obj)
        return owner.name if owner else ''

    def get_owner_email(self, obj):
        owner = self.get_owner(obj)
        return owner.email if owner else ''

    def get_owner_count(self, obj):
        return obj.staff.filter(role='hospital_admin').count()

    def get_staff_count(self, obj):
        return obj.staff.filter(is_active=True).count()

    def validate(self, attrs):
        plan = attrs.get('plan', getattr(self.instance, 'plan', 'trial'))
        total_beds = attrs.get('total_beds', getattr(self.instance, 'total_beds', 0))
        plan_config = Hospital.PLAN_CATALOG.get(plan, Hospital.PLAN_CATALOG['trial'])
        bed_limit = plan_config['limits']['beds']
        if bed_limit is not None and total_beds > bed_limit:
            raise serializers.ValidationError({
                'total_beds': f'The {plan_config["label"]} plan supports up to {bed_limit} beds.'
            })
        return attrs


class HospitalUpgradeSerializer(serializers.Serializer):
    plan = serializers.ChoiceField(choices=['trial', 'basic', 'advanced', 'enterprise'])
    billing_cycle_months = serializers.ChoiceField(choices=[1, 3, 12, 24], default=1)

    def validate(self, attrs):
        if attrs['plan'] == 'trial':
            attrs['billing_cycle_months'] = 1
        return attrs
