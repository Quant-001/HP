"""Hospital models - the root tenant entity."""

from datetime import timedelta

from django.db import models
from django.utils import timezone


class Hospital(models.Model):
    PLAN_CHOICES = [
        ('trial', 'Trial'),
        ('basic', 'Basic'),
        ('advanced', 'Advanced'),
        ('enterprise', 'Enterprise'),
    ]
    BILLING_CYCLE_CHOICES = [
        (1, 'Monthly'),
        (3, '3 months'),
        (12, '12 months'),
        (24, '24 months'),
    ]
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('suspended', 'Suspended'),
        ('trial', 'Trial'),
    ]

    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, default='US')
    logo = models.ImageField(upload_to='hospital_logos/', blank=True, null=True)
    plan = models.CharField(max_length=20, choices=PLAN_CHOICES, default='trial')
    billing_cycle_months = models.PositiveSmallIntegerField(choices=BILLING_CYCLE_CHOICES, default=1)
    subscription_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='trial')
    trial_ends_at = models.DateTimeField(blank=True, null=True)
    total_beds = models.PositiveIntegerField(default=25)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    PLAN_CATALOG = {
        'trial': {
            'label': 'Trial',
            'price': '$0/mo',
            'limits': {'departments': 2, 'beds': 25, 'doctors': 3, 'staff': 10},
            'roles': ['hospital_admin', 'doctor', 'receptionist'],
            'modules': ['patients', 'appointments', 'opd_queue', 'billing'],
        },
        'basic': {
            'label': 'Basic',
            'price': '$49/mo',
            'limits': {'departments': 5, 'beds': 50, 'doctors': 5, 'staff': 25},
            'roles': ['hospital_admin', 'doctor', 'receptionist'],
            'modules': ['patients', 'appointments', 'opd_queue', 'billing', 'medical_records'],
        },
        'advanced': {
            'label': 'Advanced',
            'price': '$149/mo',
            'limits': {'departments': 15, 'beds': 200, 'doctors': 20, 'staff': 100},
            'roles': [
                'hospital_admin', 'doctor', 'receptionist',
                'nurse', 'lab_technician', 'pharmacist',
            ],
            'modules': [
                'patients', 'appointments', 'opd_queue', 'billing', 'medical_records',
                'departments', 'pharmacy', 'laboratory', 'bed_management', 'inventory',
            ],
        },
        'enterprise': {
            'label': 'Enterprise',
            'price': '$399/mo',
            'limits': {'departments': None, 'beds': None, 'doctors': None, 'staff': None},
            'roles': [
                'hospital_admin', 'doctor', 'receptionist',
                'nurse', 'lab_technician', 'pharmacist',
            ],
            'modules': [
                'patients', 'appointments', 'opd_queue', 'billing', 'medical_records',
                'departments', 'pharmacy', 'laboratory', 'bed_management', 'inventory',
                'payroll', 'attendance', 'finance_reports', 'compliance',
                'emergency_alerts', 'vendors', 'quality_assurance', 'multi_branch',
            ],
        },
    }

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if self.plan == 'trial':
            self.billing_cycle_months = 1
            self.subscription_status = 'trial'
            if not self.trial_ends_at:
                self.trial_ends_at = timezone.now() + timedelta(days=30)
        elif self.subscription_status == 'trial':
            self.subscription_status = 'active'
        super().save(*args, **kwargs)

    @property
    def has_pharmacy(self):
        return self.has_module('pharmacy')

    @property
    def has_lab(self):
        return self.has_module('laboratory')

    @property
    def has_multi_branch(self):
        return self.has_module('multi_branch')

    @property
    def max_doctors(self):
        return self.plan_limits.get('doctors')

    @property
    def plan_catalog(self):
        return self.PLAN_CATALOG

    @property
    def plan_config(self):
        return self.PLAN_CATALOG.get(self.plan, self.PLAN_CATALOG['trial'])

    @property
    def plan_limits(self):
        return self.plan_config['limits']

    @property
    def enabled_modules(self):
        return self.plan_config['modules']

    @property
    def allowed_roles(self):
        return self.plan_config['roles']

    def has_module(self, module):
        return module in self.enabled_modules

    @property
    def has_bed_management(self):
        return self.has_module('bed_management')

    @property
    def has_inventory(self):
        return self.has_module('inventory')

    @property
    def subscription_usage(self):
        from apps.departments.models import Department
        from apps.users.models import User

        staff = User.objects.filter(hospital=self, is_active=True)
        usage = {
            'departments': Department.objects.filter(hospital=self).count(),
            'beds': self.total_beds,
            'doctors': staff.filter(role='doctor').count(),
            'staff': staff.count(),
        }
        return {
            key: {
                'used': value,
                'limit': self.plan_limits.get(key),
                'is_over_limit': self.plan_limits.get(key) is not None and value > self.plan_limits[key],
            }
            for key, value in usage.items()
        }
