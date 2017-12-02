import json
from django.shortcuts import render, HttpResponse, redirect
from arya.service import sites
from . import models

from django.urls.resolvers import RegexURLPattern


def get_all_url(patterns, prev, is_first=False, result=[]):
    if is_first:
        result.clear()
    if isinstance(patterns,list): #新增判断,采用url(r'^api/', include('repository.urls'))时,
        # 会得到patterns=<module 'repository.urls' from 'D:\\dev\\workspace1\\luffy_server\\repository\\urls.py'>的情况,
        # 无法遍历,具体原因暂时未知
        for item in patterns:
            v = item._regex.strip("^$")
            if isinstance(item, RegexURLPattern):
                val = prev + v
                result.append((val, val,))
            else:
                get_all_url(item.urlconf_name, prev + v)

    return result


from django.forms import ModelForm
from django.forms import fields
from django.forms import widgets


class PermissionModelForm(ModelForm):
    url = fields.ChoiceField()  # 若该字段名和Permission中的某字段重名,则会将该字段替换,不重名,则添加新的

    # from pro_crm.urls import urlpatterns
    # url.choices=get_all_url(urlpatterns,"/",True) #此种赋值方式1:会使urlpatterns提前执行,引发错误
    # 2.当新增url时,不能时时刷新,因为PermissionModelForm声明时会取一遍url,
    # 当用其new对象时,不会再去获取新的url,因此需要将获取url的逻辑写在__init__中


    class Meta:
        model = models.Permission
        fields = "__all__"

    def clean_urls(self,url_list=None):
        """将已存在于权限列表的url从url_list中移除,添加页面无需显示"""
        exist_urls = [obj.url for obj in models.Permission.objects.all()]
        result = []
        for item in url_list:
            if item[0] not in exist_urls:
                result.append(item)
        return result


    def __init__(self, *args, **kwargs):
        super(PermissionModelForm, self).__init__(*args, **kwargs)
        from django.conf import settings

        from importlib import import_module
        urls_module = import_module(settings.ROOT_URLCONF)
        urlpatterns = getattr(urls_module,"urlpatterns")

        self.fields["url"].choices = self.clean_urls(get_all_url(urlpatterns, "/", True))
        if self.instance and self.instance.url:
            #要把该obj的url给添加进去
            self.fields["url"].choices.append((self.instance.url,self.instance.url,))


class PermissionConfig(sites.AryaConfig):

    list_display = ["caption", "url", "menu"]

    model_form = PermissionModelForm


sites.site.register(models.Permission, PermissionConfig)


class MenuConfig(sites.AryaConfig):
    list_display = ["caption"]


sites.site.register(models.Menu, MenuConfig)


# class UserConfig(sites.AryaConfig):
#     list_display = ["username", "password"]
#
#
# sites.site.register(models.User, UserConfig)


class RoleConfig(sites.AryaConfig):
    list_display = ["caption", ]


sites.site.register(models.Role, RoleConfig)
