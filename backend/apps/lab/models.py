"""Lab Tests."""

from django.db import models


class LabTest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    hospital = models.ForeignKey('hospitals.Hospital', on_delete=models.CASCADE, related_name='lab_tests')
    patient = models.ForeignKey('patients.Patient', on_delete=models.CASCADE, related_name='lab_tests')
    appointment = models.ForeignKey('appointments.Appointment', on_delete=models.SET_NULL, null=True, blank=True)
    ordered_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, related_name='ordered_tests')
    processed_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='processed_tests')
    test_name = models.CharField(max_length=255)
    test_code = models.CharField(max_length=50, blank=True)
    category = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    result = models.TextField(blank=True)
    normal_range = models.CharField(max_length=100, blank=True)
    result_date = models.DateTimeField(null=True, blank=True)
    cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.test_name} - {self.patient.name}"
