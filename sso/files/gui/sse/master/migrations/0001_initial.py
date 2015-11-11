# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
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
            name='Master',
            fields=[
                ('id', models.AutoField(serialize=False, primary_key=True, verbose_name='ID', auto_created=True)),
                ('hostname', models.CharField(unique=True, help_text='The salt master hostname ip address', max_length=45)),
                ('netapi_port', models.IntegerField()),
                ('auth_mode', models.CharField(choices=[('pam', 'pam'), ('ldap', 'ldap')], max_length=5)),
                ('created_at', models.DateTimeField(null=True, auto_now=True)),
                ('modified_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('config', django_pgjsonb.fields.JSONField(default={}, encode_kwargs={'cls': django.core.serializers.json.DjangoJSONEncoder}, decode_kwargs={'parse_float': decimal.Decimal})),
                ('created_by', models.ForeignKey(null=True, to=settings.AUTH_USER_MODEL, related_name='+')),
                ('modified_by', models.ForeignKey(null=True, to=settings.AUTH_USER_MODEL, related_name='+')),
            ],
            options={
                'ordering': ['hostname'],
                'verbose_name_plural': 'Master',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='MasterToken',
            fields=[
                ('id', models.AutoField(serialize=False, primary_key=True, verbose_name='ID', auto_created=True)),
                ('token', models.CharField(max_length=255)),
                ('allowed_functions', models.TextField(help_text='JSON serialized text with information about what    can be done with this token.')),
                ('has_expired', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(null=True, blank=True)),
                ('master', models.ForeignKey(to='master.Master')),
                ('user', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['master'],
                'verbose_name_plural': 'Master Token',
            },
            bases=(models.Model,),
        ),
    ]
