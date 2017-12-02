from django.apps import AppConfig


class AryaConfig(AppConfig):
    name = 'arya'

    def ready(self):
        from django.utils.module_loading import autodiscover_modules
        autodiscover_modules('arya')