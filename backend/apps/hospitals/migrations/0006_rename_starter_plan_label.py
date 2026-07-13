from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('hospitals', '0005_add_starter_plan_and_shorten_trial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='hospital',
            name='plan',
            field=models.CharField(
                choices=[
                    ('trial', 'Trial'),
                    ('starter', 'Clinic / Medical'),
                    ('basic', 'Basic'),
                    ('advanced', 'Advanced'),
                    ('enterprise', 'Enterprise'),
                ],
                default='trial',
                max_length=20,
            ),
        ),
    ]
