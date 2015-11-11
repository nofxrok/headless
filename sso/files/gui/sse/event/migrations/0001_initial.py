# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Event',
            fields=[
                ('id', models.AutoField(serialize=False, primary_key=True, verbose_name='ID', auto_created=True)),
                ('data', models.CharField(null=True, max_length=255, blank=True)),
                ('tag', models.CharField(null=True, max_length=45, blank=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
