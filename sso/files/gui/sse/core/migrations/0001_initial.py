# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import mptt.fields
import decimal
import django_pgjsonb.fields
from django.conf import settings
import django.core.serializers.json


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Beacon',
            fields=[
                ('id', models.AutoField(serialize=False, primary_key=True, verbose_name='ID', auto_created=True)),
                ('name', models.TextField(help_text='Beacon name')),
                ('description', models.TextField(help_text='Description about the beacon')),
                ('file_path', models.TextField(help_text='File path where beacon file is stored')),
                ('created_at', models.DateTimeField(null=True, auto_now=True)),
                ('created_by', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-id'],
                'verbose_name_plural': 'Beacon',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='GlobalConfig',
            fields=[
                ('id', models.AutoField(serialize=False, primary_key=True, verbose_name='ID', auto_created=True)),
                ('name', models.CharField(help_text='Stores the     type of the configuration', max_length=10)),
                ('value', models.TextField(help_text='Stores the actual value of     the configuration')),
            ],
            options={
                'verbose_name_plural': 'Global Config',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Grains',
            fields=[
                ('id', models.AutoField(serialize=False, primary_key=True, verbose_name='ID', auto_created=True)),
                ('name', models.CharField(max_length=255)),
            ],
            options={
                'ordering': ['name'],
                'verbose_name_plural': 'Grains',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='GrainsValue',
            fields=[
                ('id', models.AutoField(serialize=False, primary_key=True, verbose_name='ID', auto_created=True)),
                ('value', models.TextField(help_text='List of possible grain values     from all available minions')),
                ('grain', models.ForeignKey(to='core.Grains')),
            ],
            options={
                'ordering': ['grain'],
                'verbose_name_plural': 'GrainsValue',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='MinionFilter',
            fields=[
                ('id', models.AutoField(serialize=False, primary_key=True, verbose_name='ID', auto_created=True)),
                ('filter_name', models.CharField(help_text='Add a filter name.', max_length=30)),
                ('search_type', models.IntegerField(default=1, choices=[(1, 'Text'), (2, 'Grains'), (3, 'Both')])),
                ('match_parameters', models.IntegerField(default=1, choices=[(1, 'Contains'), (2, 'Does Not Contains'), (3, 'Starts With'), (4, 'Ends With'), (5, 'Is')])),
                ('search_field', models.IntegerField(default=1, choices=[(1, 'Node'), (2, 'Master'), (3, 'Target Group'), (4, 'IP Address')])),
                ('search_text', models.CharField(null=True, max_length=30, blank=True)),
                ('search_grains', django_pgjsonb.fields.JSONField(default={}, decode_kwargs={'parse_float': decimal.Decimal}, encode_kwargs={'cls': django.core.serializers.json.DjangoJSONEncoder}, blank=True)),
                ('created_at', models.DateTimeField(null=True, blank=True)),
                ('user', models.ForeignKey(to=settings.AUTH_USER_MODEL, help_text='User which this filter belongs to.')),
            ],
            options={
                'ordering': ['filter_name'],
                'verbose_name_plural': 'Minion Filter',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Pillar',
            fields=[
                ('name', models.CharField(serialize=False, primary_key=True, max_length=255)),
                ('data', django_pgjsonb.fields.JSONField(encode_kwargs={'cls': django.core.serializers.json.DjangoJSONEncoder}, decode_kwargs={'parse_float': decimal.Decimal})),
                ('created_at', models.DateTimeField(null=True, auto_now=True)),
                ('modified_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('created_by', models.ForeignKey(null=True, to=settings.AUTH_USER_MODEL, related_name='+')),
                ('modified_by', models.ForeignKey(null=True, to=settings.AUTH_USER_MODEL, related_name='+')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='SystemFolder',
            fields=[
                ('id', models.AutoField(serialize=False, primary_key=True, verbose_name='ID', auto_created=True)),
                ('name', models.CharField(max_length=255)),
                ('created_at', models.DateTimeField(null=True, auto_now=True)),
                ('modified_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('lft', models.PositiveIntegerField(editable=False, db_index=True)),
                ('rght', models.PositiveIntegerField(editable=False, db_index=True)),
                ('tree_id', models.PositiveIntegerField(editable=False, db_index=True)),
                ('level', models.PositiveIntegerField(editable=False, db_index=True)),
                ('created_by', models.ForeignKey(null=True, to=settings.AUTH_USER_MODEL, related_name='+')),
                ('modified_by', models.ForeignKey(null=True, to=settings.AUTH_USER_MODEL, related_name='+')),
                ('parent', mptt.fields.TreeForeignKey(null=True, blank=True, to='core.SystemFolder', related_name='children')),
            ],
            options={
                'ordering': ['name'],
                'verbose_name_plural': 'System Folder',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='UserProfile',
            fields=[
                ('id', models.AutoField(serialize=False, primary_key=True, verbose_name='ID', auto_created=True)),
                ('is_admin', models.BooleanField(default=False)),
                ('is_superuser', models.BooleanField(default=False)),
                ('is_user', models.BooleanField(default=False)),
                ('user', models.OneToOneField(to=settings.AUTH_USER_MODEL)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.AlterUniqueTogether(
            name='systemfolder',
            unique_together=set([('name', 'parent')]),
        ),
    ]
