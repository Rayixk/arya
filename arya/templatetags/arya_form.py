#!/usr/bin/env python
# -*- coding:utf-8 -*-
from django.template import Library
from django.urls import reverse
from django.forms.models import ModelChoiceField
from arya.service.sites import site

register = Library()


@register.inclusion_tag('arya/change_form.html')
def show_form(form,request,popup_id=None):
    is_change = True if "/change/" in request.path_info else '' #用来标识是否是编辑页
    def inner():
        for item in form:
            row = {'popup': False, 'item': item, 'popup_url': None}
            if isinstance(item.field, ModelChoiceField) and item.field.queryset.model in site._registry:
                row['popup'] = True
                opt = item.field.queryset.model._meta
                url_name = "{0}:{1}_{2}_add".format(site.namespace, opt.app_label, opt.model_name)
                row['popup_url'] = "{0}?_popup={1}".format(reverse(url_name), item.auto_id)
            yield row

    return {'form': inner(),"popup_id":popup_id,"is_change":is_change}
