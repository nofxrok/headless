"""
    Serializers for core app
"""

from core.models import GlobalConfig, UserProfile, MinionFilter, GrainsValue, Grains, Beacon
from django.contrib.auth.models import User
from rest_framework import serializers
import os
import itertools
from master.models import MasterToken

class UserProfileSerializer(serializers.ModelSerializer):
    """
        UserProfile Model Serializer
    """
    class Meta:
        model = UserProfile
        fields = ('user', 'is_user', 'is_admin', 'is_superuser')


class UserSerializer(serializers.ModelSerializer):
    """
        User Model Serializer
    """
    userprofile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = (
            'username', 'first_name', 'last_name', 'email', 'userprofile')


class EditUserSerializer(serializers.ModelSerializer):
    """
        Edit User Serializer
    """

    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'email')


class UserDetailSerializer(serializers.ModelSerializer):
    """
        User Details Serializer
    """
    userprofile = UserProfileSerializer(read_only=True)
    permissions = serializers.RelatedField(source="id")

    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'email',
                  'userprofile', 'permissions')

    def transform_permissions(self, obj, value):
        return [{"hostname": obj.master.hostname, "allowed_functions": eval(obj.allowed_functions)}
                for obj in MasterToken.objects.filter(user=obj)]


class MinionFilterSerializer(serializers.ModelSerializer):
    """
        Minion Filter Serializer
    """
    class Meta:
        model = MinionFilter
        fields = ('user', 'filter_name', 'search_type', "search_field",
                  'match_parameters', 'search_text', 'search_grains')


class GrainsValueSerializer(serializers.ModelSerializer):
    """
        GrainsValue Model Serializer
    """
    class Meta:
        model = GrainsValue
        fields = ('value',)


class GrainsSerializer(serializers.ModelSerializer):
    """
        Grains Model Serializer
    """
    grainsvalue_set = GrainsValueSerializer(read_only=True)

    class Meta:
        model = Grains
        fields = ('name', 'grainsvalue_set')


class BeaconSerializer(serializers.ModelSerializer):

    file_path = serializers.CharField()
    created_by = UserSerializer(many=False, read_only=True)

    def transform_file_path(self, obj, file_path):
        """
            Transform the file field to send rel and abs path with other metadta
        """
        if os.path.exists(file_path) and os.path.isfile(file_path):
            size = os.stat(file_path).st_size
            filename = os.path.basename(file_path)
            content = open(file_path, "r").read()
            return dict(size=size, filename=filename, content=content)
        return None

    class Meta:
        model = Beacon
        fields = ("id", "name", "description", "file_path", "created_by", "created_at")


class BeaconUploadSerializer(serializers.ModelSerializer):

    class Meta:
        model = Beacon
        fields = ("name", "description", "file_path", "created_by")
