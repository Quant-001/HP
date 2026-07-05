"""Patient model - scoped to hospital."""

from django.db import models


class Patient(models.Model):
    BLOOD_GROUP_CHOICES = [
        ('A+', 'A+'), ('A-', 'A-'), ('B+', 'B+'), ('B-', 'B-'),
        ('AB+', 'AB+'), ('AB-', 'AB-'), ('O+', 'O+'), ('O-', 'O-'),
    ]
    GENDER_CHOICES = [('M', 'Male'), ('F', 'Female'), ('O', 'Other')]
    STATUS_CHOICES = [('active', 'Active'), ('discharged', 'Discharged'), ('deceased', 'Deceased')]

    hospital = models.ForeignKey('hospitals.Hospital', on_delete=models.CASCADE, related_name='patients')
    patient_id = models.CharField(max_length=20, unique=True)  # e.g. MED-0001
    name = models.CharField(max_length=255)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    blood_group = models.CharField(max_length=3, choices=BLOOD_GROUP_CHOICES, blank=True)
    address = models.TextField(blank=True)
    emergency_contact = models.CharField(max_length=255, blank=True)
    emergency_phone = models.CharField(max_length=20, blank=True)
    allergies = models.TextField(blank=True)
    chronic_conditions = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    registered_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.patient_id} - {self.name}"

    def save(self, *args, **kwargs):
        if not self.patient_id:
            # Auto-generate patient ID
            last = Patient.objects.filter(hospital=self.hospital).order_by('-id').first()
            num = (last.id + 1) if last else 1
            self.patient_id = f"MED-{num:04d}"
        super().save(*args, **kwargs)

    @property
    def age(self):
        from datetime import date
        today = date.today()
        b = self.date_of_birth
        if isinstance(b, str):
            from datetime import datetime
            b = datetime.strptime(b, "%Y-%m-%d").date()
        return today.year - b.year - ((today.month, today.day) < (b.month, b.day))
