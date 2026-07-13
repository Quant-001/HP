from datetime import timedelta

from django.db import migrations, models


def shorten_trial_end_dates(apps, schema_editor):
    Hospital = apps.get_model('hospitals', 'Hospital')
    for hospital in Hospital.objects.filter(plan='trial'):
        trial_end = hospital.created_at + timedelta(days=3)
        if hospital.trial_ends_at is None or hospital.trial_ends_at > trial_end:
            hospital.trial_ends_at = trial_end
            hospital.save(update_fields=['trial_ends_at'])


class Migration(migrations.Migration):

    dependencies = [
        ('hospitals', '0004_hospital_trial_ends_at'),
    ]

    operations = [
        migrations.AlterField(
            model_name='hospital',
            name='plan',
            field=models.CharField(
                choices=[
                    ('trial', 'Trial'),
                    ('starter', 'Starter'),
                    ('basic', 'Basic'),
                    ('advanced', 'Advanced'),
                    ('enterprise', 'Enterprise'),
                ],
                default='trial',
                max_length=20,
            ),
        ),
        migrations.RunPython(shorten_trial_end_dates, migrations.RunPython.noop),
    ]
