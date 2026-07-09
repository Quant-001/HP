from datetime import timedelta

from django.db import migrations, models


def backfill_trial_end_dates(apps, schema_editor):
    Hospital = apps.get_model('hospitals', 'Hospital')
    for hospital in Hospital.objects.filter(plan='trial', trial_ends_at__isnull=True):
        hospital.trial_ends_at = hospital.created_at + timedelta(days=30)
        hospital.billing_cycle_months = 1
        hospital.subscription_status = 'trial'
        hospital.save(update_fields=['trial_ends_at', 'billing_cycle_months', 'subscription_status'])


class Migration(migrations.Migration):

    dependencies = [
        ('hospitals', '0003_hospital_billing_cycle_months'),
    ]

    operations = [
        migrations.AddField(
            model_name='hospital',
            name='trial_ends_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.RunPython(backfill_trial_end_dates, migrations.RunPython.noop),
    ]
