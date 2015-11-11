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
        ('minion', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Function',
            fields=[
                ('id', models.AutoField(serialize=False, primary_key=True, verbose_name='ID', auto_created=True)),
                ('name', models.CharField(null=True, max_length=45, blank=True)),
            ],
            options={
                'ordering': ['name'],
                'verbose_name_plural': 'Function',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='jids',
            fields=[
                ('jid', models.CharField(serialize=False, primary_key=True, max_length=255)),
                ('load', django_pgjsonb.fields.JSONField(encode_kwargs={'cls': django.core.serializers.json.DjangoJSONEncoder}, decode_kwargs={'parse_float': decimal.Decimal})),
            ],
            options={
                'db_table': 'jids',
                'ordering': ['jid'],
                'verbose_name_plural': 'jids',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Job',
            fields=[
                ('id', models.AutoField(serialize=False, primary_key=True, verbose_name='ID', auto_created=True)),
                ('execute', models.CharField(default='now', choices=[('now', 'Now'), ('future', 'Future')], max_length=50)),
                ('execute_at', models.DateTimeField(null=True, blank=True)),
                ('retry_option', models.CharField(null=True, choices=[(None, None), ('retry_count', 'Retry Count'), ('end_after', 'End After')], max_length=50, blank=True)),
                ('retry_count', models.IntegerField(null=True, help_text='Retry x times if a job fails', default=0, blank=True)),
                ('end_after', models.DateTimeField(null=True, help_text='Retry till x datetime', blank=True)),
                ('run_type', models.CharField(default='run', choices=[('run', 'Run'), ('simulate', 'Simulate')], max_length=50)),
                ('action_on_error', models.CharField(default='ignore', choices=[('ignore', 'Ignore'), ('pause', 'Pause')], max_length=50)),
                ('priority', models.CharField(default='normal', choices=[('none', 'None'), ('normal', 'Normal'), ('medium', 'Medium'), ('high', 'High')], max_length=50)),
                ('status', models.IntegerField(default=1, choices=[(1, 'scheduled'), (2, 'running'), (3, 'failed'), (4, 'partial'), (5, 'failure'), (6, 'complete')])),
                ('created_at', models.DateTimeField()),
                ('modified_at', models.DateTimeField(null=True, blank=True)),
                ('created_by', models.ForeignKey(to=settings.AUTH_USER_MODEL, related_name='+')),
                ('modified_by', models.ForeignKey(to=settings.AUTH_USER_MODEL, related_name='+')),
            ],
            options={
                'ordering': ['-execute_at'],
                'verbose_name_plural': 'Job',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='JobTargetMinion',
            fields=[
                ('id', models.AutoField(serialize=False, primary_key=True, verbose_name='ID', auto_created=True)),
                ('job', models.ForeignKey(to='job.Job')),
                ('minion', models.ForeignKey(to='minion.Minion')),
            ],
            options={
                'ordering': ['job'],
                'verbose_name_plural': 'Job Minion Target',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Module',
            fields=[
                ('id', models.AutoField(serialize=False, primary_key=True, verbose_name='ID', auto_created=True)),
                ('name', models.CharField(null=True, max_length=45, blank=True)),
            ],
            options={
                'ordering': ['name'],
                'verbose_name_plural': 'Module',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='salt_events',
            fields=[
                ('id', models.AutoField(serialize=False, primary_key=True, verbose_name='ID', auto_created=True)),
                ('tag', models.CharField(db_index=True, max_length=255)),
                ('data', django_pgjsonb.fields.JSONField(encode_kwargs={'cls': django.core.serializers.json.DjangoJSONEncoder}, decode_kwargs={'parse_float': decimal.Decimal})),
                ('alter_time', models.DateTimeField(auto_now=True)),
                ('master_id', models.CharField(db_index=True, max_length=255)),
            ],
            options={
                'db_table': 'salt_events',
                'verbose_name_plural': 'salt_events',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='salt_returns',
            fields=[
                ('pk_id', models.AutoField(serialize=False, primary_key=True)),
                ('id', models.CharField(db_index=True, max_length=255)),
                ('alter_time', models.DateTimeField(auto_now_add=True)),
                ('full_ret', django_pgjsonb.fields.JSONField(encode_kwargs={'cls': django.core.serializers.json.DjangoJSONEncoder}, decode_kwargs={'parse_float': decimal.Decimal})),
                ('fun', models.CharField(db_index=True, max_length=50)),
                ('jid', models.CharField(db_index=True, max_length=255)),
                ('return_value', django_pgjsonb.fields.JSONField(db_column='return', encode_kwargs={'cls': django.core.serializers.json.DjangoJSONEncoder}, decode_kwargs={'parse_float': decimal.Decimal})),
                ('success', models.CharField(max_length=10)),
            ],
            options={
                'db_table': 'salt_returns',
                'ordering': ['jid'],
                'verbose_name_plural': 'salt_returns',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='SLSInformation',
            fields=[
                ('id', models.AutoField(serialize=False, primary_key=True, verbose_name='ID', auto_created=True)),
                ('description', models.TextField()),
                ('filename', models.CharField(max_length=255)),
                ('location', models.CharField(max_length=2048)),
                ('name', models.CharField(max_length=255)),
                ('file_type', models.CharField(default='orchestrate', choices=[('state', 'state'), ('orchestrate', 'orchestrate')], max_length=50)),
                ('created_at', models.DateTimeField(null=True, blank=True)),
                ('created_by', models.ForeignKey(null=True, to=settings.AUTH_USER_MODEL, related_name='+')),
            ],
            options={
                'ordering': ['name'],
                'verbose_name_plural': 'SLS Information',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='StateFolder',
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
                ('parent', mptt.fields.TreeForeignKey(null=True, blank=True, to='job.StateFolder', related_name='children')),
            ],
            options={
                'ordering': ['name'],
                'verbose_name_plural': 'State Folder',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='UserJobNotification',
            fields=[
                ('id', models.AutoField(serialize=False, primary_key=True, verbose_name='ID', auto_created=True)),
                ('job', models.ForeignKey(to='job.Job')),
                ('user', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-job'],
                'verbose_name_plural': 'User Job Notification',
            },
            bases=(models.Model,),
        ),
        migrations.AlterUniqueTogether(
            name='statefolder',
            unique_together=set([('name', 'parent')]),
        ),
        migrations.AddField(
            model_name='slsinformation',
            name='state_folder',
            field=models.ForeignKey(null=True, blank=True, to='job.StateFolder'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='job',
            name='sls_info',
            field=models.ForeignKey(to='job.SLSInformation'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='function',
            name='module',
            field=models.ForeignKey(to='job.Module'),
            preserve_default=True,
        ),
    ]
