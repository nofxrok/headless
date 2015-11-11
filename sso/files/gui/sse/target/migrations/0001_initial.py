# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('minion', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Target',
            fields=[
                ('id', models.AutoField(serialize=False, primary_key=True, verbose_name='ID', auto_created=True)),
                ('target_name', models.CharField(max_length=255)),
                ('salt_target', models.CharField(null=True, max_length=255)),
                ('target_type', models.CharField(default='list', choices=[('glob', 'Globbing'), ('regex', 'Regular Expressions'), ('list', 'Lists'), ('grains', 'Grains'), ('subnet/ip', 'Subnet/IP Address'), ('compound', 'Compound'), ('nodegroups', 'Node groups')], max_length=50)),
                ('created_at', models.DateTimeField(null=True, blank=True)),
                ('modified_at', models.DateTimeField(null=True, blank=True)),
                ('is_quick_target', models.BooleanField(default=False)),
                ('created_by', models.ForeignKey(null=True, to=settings.AUTH_USER_MODEL, related_name='+')),
                ('modified_by', models.ForeignKey(null=True, to=settings.AUTH_USER_MODEL, related_name='+')),
                ('pillars', models.ManyToManyField(to='core.Pillar', related_name='targets')),
                ('system_folder', models.ForeignKey(null=True, blank=True, to='core.SystemFolder')),
            ],
            options={
                'ordering': ['target_name'],
                'verbose_name_plural': 'Target',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='TargetMinions',
            fields=[
                ('id', models.AutoField(serialize=False, primary_key=True, verbose_name='ID', auto_created=True)),
                ('minion', models.ForeignKey(to='minion.Minion')),
                ('target', models.ForeignKey(to='target.Target')),
            ],
            options={
                'ordering': ['target_id'],
                'verbose_name_plural': 'Target Minions',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='UserFavorites',
            fields=[
                ('id', models.AutoField(serialize=False, primary_key=True, verbose_name='ID', auto_created=True)),
                ('target', models.ForeignKey(to='target.Target')),
                ('user', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['user'],
                'verbose_name_plural': 'User Favorites',
            },
            bases=(models.Model,),
        ),
        migrations.AlterUniqueTogether(
            name='target',
            unique_together=set([('is_quick_target', 'created_by', 'target_name', 'system_folder')]),
        ),
    ]
