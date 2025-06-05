from django.apps import AppConfig


class DecowebConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "decoweb"

    def ready(self):
        # Implicitly connect signal handlers decorated with @receiver.
        from . import signals
