from django.db import models
from django.db.models import F


class ImageUpload(models.Model):
    image = models.ImageField(upload_to='images/')


class ConversionStats(models.Model):
    files_converted = models.BigIntegerField(default=0)

    class Meta:
        verbose_name = "Statistiques de conversion"

    @classmethod
    def get_count(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj.files_converted

    @classmethod
    def increment(cls, count=1):
        cls.objects.get_or_create(pk=1)
        cls.objects.filter(pk=1).update(files_converted=F('files_converted') + count)
