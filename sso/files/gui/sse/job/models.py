from django.contrib.auth.models import User
from django.db import models
from django_pgjsonb import JSONField
from master.models import Master
from minion.models import Minion, TargetCollections
from mptt.models import MPTTModel, TreeForeignKey
from target.models import Target


class jids(models.Model):

    '''
    Table required by the salt MySQL returner
    '''
    jid = models.CharField(max_length=255, primary_key=True)
    load = JSONField()

    def __unicode__(self):
        return self.jid

    class Meta:
        db_table = 'jids'
        ordering = ['jid']
        verbose_name_plural = 'jids'


class salt_events(models.Model):
    '''
    Table to store events returned by a salt master
    '''
    tag = models.CharField(max_length=255, db_index=True)
    data = JSONField()
    alter_time = models.DateTimeField(auto_now=True)
    master_id = models.CharField(max_length=255, db_index=True)

    class Meta:
        db_table = 'salt_events'
        verbose_name_plural = 'salt_events'


class salt_returns(models.Model):

    '''
    Table required by the salt MySQL returner. This will be updated
    independently of sse_job_run. A separate job will need to sync data
    between the two tables
    '''

    pk_id = models.AutoField(primary_key=True)
    id = models.CharField(max_length=255, db_index=True)
    alter_time = models.DateTimeField(auto_now_add=True)
    full_ret = JSONField()
    fun = models.CharField(max_length=50, db_index=True)
    jid = models.CharField(max_length=255, db_index=True)
    return_value = JSONField(db_column="return")
    success = models.CharField(max_length=10)

    def __unicode__(self):
        return self.jid

    class Meta:
        db_table = "salt_returns"
        ordering = ["jid"]
        verbose_name_plural = "salt_returns"


class Module(models.Model):

    """
        Model to store Salt Module names
    """

    name = models.CharField(max_length=45, null=True, blank=True)

    def __unicode__(self):
        return self.name

    def __str__(self):
        return self.name

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "Module"


class Function(models.Model):

    """
        Model to store function names for Salt Modules
    """

    module = models.ForeignKey("Module")
    name = models.CharField(max_length=45, null=True, blank=True)

    def __unicode__(self):
        return self.name

    def __str__(self):
        return self.name

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "Function"


class Job(models.Model):

    """
        Table to store the job details submitted from the SSE User. All jobs will need to be async.
        Data will be stored in the table and a background process will handle submitting the job.
        Immediate and one time jobs will be submitted by a single process scheduled in cron to run
        every minute.
    """

    STATUS_CHOICES = (
        (1, "scheduled"),
        (2, "running"),
        (3, "failed"),
        (4, "partial"),
        (5, "failure"),
        (6, "complete"),
    )

    EXECUTE_CHOICES = (
                       ("now", "Now"),
                       ("future", "Future"),
                       )

    RETRY_CHOICES = (
                     (None, None),
                     ("retry_count", "Retry Count"),
                     ("end_after", "End After"),
                     )

    RUN_TYPE = (
                ("run", "Run"),
                ("simulate", "Simulate")
                )

    ERROR_ACTION = (
                    ("ignore", "Ignore"),
                    ("pause", "Pause"),
                    )

    PRIORITY = (
                ("none", "None"),
                ("normal", "Normal"),
                ("medium", "Medium"),
                ("high", "High"),
                )

    sls_info = models.ForeignKey("SLSInformation")

    # scheduler meta data
    execute = models.CharField(max_length=50, default="now", choices=EXECUTE_CHOICES)
    execute_at = models.DateTimeField(blank=True, null=True)
    retry_option = models.CharField(max_length=50, blank=True, null=True, choices=RETRY_CHOICES)
    retry_count = models.IntegerField(default=0, blank=True, null=True, help_text="Retry x times if a job fails")
    end_after = models.DateTimeField(blank=True, null=True, help_text="Retry till x datetime")

    # run meta data
    run_type = models.CharField(max_length=50, default="run", choices=RUN_TYPE)
    action_on_error = models.CharField(max_length=50, default="ignore", choices=ERROR_ACTION)
    priority = models.CharField(max_length=50, default="normal", choices=PRIORITY)
    status = models.IntegerField(choices=STATUS_CHOICES, default=1)

    # audit metadata
    created_at = models.DateTimeField(auto_now_add=False)
    created_by = models.ForeignKey(User, related_name="+")

    modified_at = models.DateTimeField(blank=True, null=True)
    modified_by = models.ForeignKey(User, related_name="+")

    def __unicode__(self):
        return self.status

    class Meta:
        ordering = ["-execute_at"]
        verbose_name_plural = "Job"


class UserJobNotification(models.Model):

    """
        List of users associated with the job who will be notified.
    """

    job = models.ForeignKey(Job)
    user = models.ForeignKey(User)

    def __unicode__(self):
        return self.user

    class Meta:
        ordering = ["-job"]
        verbose_name_plural = "User Job Notification"

class JobTargetMinion(models.Model):

    """
        List of minions targeted for the job. This table is populated if a
        saved target/collection is not being used.
    """

    job = models.ForeignKey(Job)
    minion = models.ForeignKey(Minion)
#     target = models.ForeignKey(Target)

    def __unicode__(self):
        return self.job

    class Meta:
        ordering = ["job"]
        verbose_name_plural = "Job Minion Target"


class StateFolder(MPTTModel):
    """
        Model to maintain the Private, Public Folder structure
    """
    name = models.CharField(max_length=255)
    parent = TreeForeignKey("self", null=True, blank=True, related_name="children")

    created_at = models.DateTimeField(blank=True, null=True, auto_now=True)
    created_by = models.ForeignKey(User, related_name="+", null=True)

    modified_at = models.DateTimeField(blank=True, null=True, auto_now_add=True)
    modified_by = models.ForeignKey(User, related_name="+", null=True)

    def __str__(self):
        return self.name

    class Meta:
        unique_together = (("name", "parent"),)
        ordering = ["name"]
        verbose_name_plural = "State Folder"

    class MPTTMeta:
        order_insertion_by = ["name"]


class SLSInformation(models.Model):

    """
        Schema to store the uploaded sls file information. It holds information like
        filename, user, when was the fileuploade, file location etc
    """
    FILE_TYPE_CHOICES = (("state", "state"),
                         ("orchestrate", "orchestrate"))

    description = models.TextField()
    filename = models.CharField(max_length=255)
    location = models.CharField(max_length=2048)
    name = models.CharField(max_length=255)
    state_folder = models.ForeignKey(StateFolder, blank=True, null=True)
    file_type = models.CharField(max_length=50, default="orchestrate", choices=FILE_TYPE_CHOICES)
    created_at = models.DateTimeField(blank=True, null=True)
    created_by = models.ForeignKey(User, related_name="+", null=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "SLS Information"

