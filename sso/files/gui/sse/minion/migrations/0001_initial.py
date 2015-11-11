# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import decimal
import django_pgjsonb.fields
from django.conf import settings
import django.core.serializers.json


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0001_initial'),
        ('master', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Minion',
            fields=[
                ('id', models.AutoField(serialize=False, primary_key=True, verbose_name='ID', auto_created=True)),
                ('hostname', models.CharField(help_text='The salt minion hostname/ip address', max_length=255)),
                ('minion_id', models.CharField(max_length=255)),
                ('config', django_pgjsonb.fields.JSONField(default={}, encode_kwargs={'cls': django.core.serializers.json.DjangoJSONEncoder}, decode_kwargs={'parse_float': decimal.Decimal})),
                ('pillar_config', django_pgjsonb.fields.JSONField(default={}, encode_kwargs={'cls': django.core.serializers.json.DjangoJSONEncoder}, decode_kwargs={'parse_float': decimal.Decimal})),
                ('is_minion_up', models.BooleanField(default=True)),
                ('last_seen', models.DateTimeField(null=True, blank=True)),
                ('key_status', models.IntegerField(default=1, choices=[(1, 'pending'), (0, 'accepted'), (2, 'rejected'), (3, 'deleted')])),
                ('master', models.ForeignKey(to='master.Master', help_text='The master to which this minion belongs.')),
            ],
            options={
                'ordering': ['hostname'],
                'verbose_name_plural': 'Minion',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='MinionBeacon',
            fields=[
                ('id', models.AutoField(serialize=False, primary_key=True, verbose_name='ID', auto_created=True)),
                ('created_at', models.DateTimeField(null=True, auto_now=True)),
                ('modified_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('beacon', models.ForeignKey(to='core.Beacon')),
                ('created_by', models.ForeignKey(null=True, to=settings.AUTH_USER_MODEL, related_name='+')),
                ('minion', models.ForeignKey(to='minion.Minion')),
                ('modified_by', models.ForeignKey(null=True, to=settings.AUTH_USER_MODEL, related_name='+')),
            ],
            options={
                'ordering': ['minion'],
                'verbose_name_plural': 'Minion Beacons',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='MinionCollection',
            fields=[
                ('id', models.AutoField(serialize=False, primary_key=True, verbose_name='ID', auto_created=True)),
            ],
            options={
                'ordering': ['minion'],
                'verbose_name_plural': 'Minion Collection',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='TargetCollections',
            fields=[
                ('id', models.AutoField(serialize=False, primary_key=True, verbose_name='ID', auto_created=True)),
                ('name', models.CharField(max_length=255)),
                ('description', models.TextField(null=True, blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('modified_at', models.DateTimeField()),
                ('created_by', models.ForeignKey(to=settings.AUTH_USER_MODEL, related_name='+')),
                ('modified_by', models.ForeignKey(to=settings.AUTH_USER_MODEL, related_name='+')),
                ('parent_collection_id', models.ForeignKey(to='minion.TargetCollections', help_text='The parent collection.     Collections are hierarchical in nature.')),
            ],
            options={
                'ordering': ['name'],
                'verbose_name_plural': 'Target Collection',
            },
            bases=(models.Model,),
        ),
        migrations.AddField(
            model_name='minioncollection',
            name='collection',
            field=models.ForeignKey(to='minion.TargetCollections'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='minioncollection',
            name='minion',
            field=models.ForeignKey(to='minion.Minion'),
            preserve_default=True,
        ),
    ]
