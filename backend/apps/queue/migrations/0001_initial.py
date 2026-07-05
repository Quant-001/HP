# Generated manually for Hospora queue management.

import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('appointments', '0002_initial'),
        ('departments', '0002_initial'),
        ('hospitals', '0001_initial'),
        ('patients', '0002_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='QueueTicket',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('token_number', models.PositiveIntegerField()),
                ('queue_date', models.DateField(default=django.utils.timezone.localdate)),
                ('priority', models.CharField(choices=[('normal', 'Normal'), ('urgent', 'Urgent'), ('emergency', 'Emergency')], default='normal', max_length=20)),
                ('status', models.CharField(choices=[('waiting', 'Waiting'), ('called', 'Called'), ('in_progress', 'In Progress'), ('completed', 'Completed'), ('cancelled', 'Cancelled'), ('no_show', 'No Show')], default='waiting', max_length=20)),
                ('visit_reason', models.CharField(blank=True, max_length=255)),
                ('notes', models.TextField(blank=True)),
                ('called_at', models.DateTimeField(blank=True, null=True)),
                ('completed_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('appointment', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='queue_tickets', to='appointments.appointment')),
                ('created_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='created_queue_tickets', to=settings.AUTH_USER_MODEL)),
                ('department', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='queue_tickets', to='departments.department')),
                ('doctor', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='queue_tickets', to=settings.AUTH_USER_MODEL)),
                ('hospital', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='queue_tickets', to='hospitals.hospital')),
                ('patient', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='queue_tickets', to='patients.patient')),
            ],
            options={
                'ordering': ['queue_date', 'token_number'],
                'unique_together': {('hospital', 'queue_date', 'token_number')},
            },
        ),
        migrations.AddIndex(
            model_name='queueticket',
            index=models.Index(fields=['hospital', 'queue_date', 'status'], name='queue_queu_hospital_7658b7_idx'),
        ),
        migrations.AddIndex(
            model_name='queueticket',
            index=models.Index(fields=['hospital', 'doctor', 'queue_date'], name='queue_queu_hospital_926a3e_idx'),
        ),
    ]
