# Generated by Django 3.2.4 on 2021-07-22 02:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('whiteboard', '0002_auto_20210719_0150'),
    ]

    operations = [
        migrations.AddField(
            model_name='board',
            name='public',
            field=models.BooleanField(default=False),
        ),
    ]
