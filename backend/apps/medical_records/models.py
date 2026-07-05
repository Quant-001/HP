from django.db import models

class MedicalRecord(models.Model):
    hospital = models.ForeignKey("hospitals.Hospital", on_delete=models.CASCADE, related_name="medical_records")
    patient = models.ForeignKey("patients.Patient", on_delete=models.CASCADE, related_name="medical_records")
    appointment = models.OneToOneField("appointments.Appointment", on_delete=models.SET_NULL, null=True, blank=True)
    doctor = models.ForeignKey("users.User", on_delete=models.SET_NULL, null=True, related_name="medical_records")
    diagnosis = models.TextField()
    symptoms = models.TextField(blank=True)
    treatment = models.TextField(blank=True)
    prescription = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    follow_up_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Record: {self.patient.name} - {self.created_at.date()}"
