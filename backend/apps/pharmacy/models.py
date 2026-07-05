"""Pharmacy - Medicine inventory."""

from django.db import models


class Medicine(models.Model):
    CATEGORY_CHOICES = [
        ('tablet', 'Tablet'), ('capsule', 'Capsule'), ('syrup', 'Syrup'),
        ('injection', 'Injection'), ('cream', 'Cream/Ointment'),
        ('drops', 'Drops'), ('other', 'Other'),
    ]

    hospital = models.ForeignKey('hospitals.Hospital', on_delete=models.CASCADE, related_name='medicines')
    name = models.CharField(max_length=255)
    generic_name = models.CharField(max_length=255, blank=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='tablet')
    manufacturer = models.CharField(max_length=255, blank=True)
    stock = models.PositiveIntegerField(default=0)
    min_stock = models.PositiveIntegerField(default=10)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    expiry_date = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.hospital.name})"

    @property
    def is_low_stock(self):
        return self.stock <= self.min_stock
