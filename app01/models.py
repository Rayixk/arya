from django.db import models
from arya.models import Role


class Account(models.Model):
    username = models.CharField("用户名", max_length=64, unique=True)
    password = models.CharField("密码", max_length=128)
    roles = models.ManyToManyField(to=Role, verbose_name="角色")
