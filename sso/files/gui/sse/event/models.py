from django.db import models


class Event(models.Model):

    """
    """

    data = models.CharField(max_length=255, blank=True, null=True)
    tag = models.CharField(max_length=45, blank=True, null=True)

    def __unicode__(self):
        return self.data
