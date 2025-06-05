from django.dispatch import receiver
from django.contrib.sessions.models import Session
from django.db.models.signals import pre_delete

from .models import Strategy

@receiver(pre_delete, sender=Session)
def session_deleted(instance, **kwargs):
    ids = instance.get_decoded().get("strategies", None)
    if ids:
        Strategy.objects.filter(id__in=ids, user__isnull=True).delete()