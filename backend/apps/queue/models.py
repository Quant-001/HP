from django.db import models
from django.utils import timezone


class QueueTicket(models.Model):
    STATUS_CHOICES = [
        ('waiting', 'Waiting'),
        ('called', 'Called'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show'),
    ]
    PRIORITY_CHOICES = [
        ('normal', 'Normal'),
        ('urgent', 'Urgent'),
        ('emergency', 'Emergency'),
    ]

    hospital = models.ForeignKey('hospitals.Hospital', on_delete=models.CASCADE, related_name='queue_tickets')
    patient = models.ForeignKey('patients.Patient', on_delete=models.CASCADE, related_name='queue_tickets')
    appointment = models.ForeignKey('appointments.Appointment', on_delete=models.SET_NULL, null=True, blank=True, related_name='queue_tickets')
    doctor = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='queue_tickets')
    department = models.ForeignKey('departments.Department', on_delete=models.SET_NULL, null=True, blank=True, related_name='queue_tickets')
    token_number = models.PositiveIntegerField()
    queue_date = models.DateField(default=timezone.localdate)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='normal')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='waiting')
    visit_reason = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)
    called_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, related_name='created_queue_tickets')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['queue_date', 'token_number']
        unique_together = ['hospital', 'queue_date', 'token_number']
        indexes = [
            models.Index(fields=['hospital', 'queue_date', 'status']),
            models.Index(fields=['hospital', 'doctor', 'queue_date']),
        ]

    def save(self, *args, **kwargs):
        if not self.token_number:
            last = QueueTicket.objects.filter(
                hospital=self.hospital,
                queue_date=self.queue_date,
            ).order_by('-token_number').first()
            self.token_number = (last.token_number + 1) if last else 1
        super().save(*args, **kwargs)

    def __str__(self):
        return f'Token {self.token_number} - {self.patient.name}'
