from django.contrib import admin
from django.contrib.auth.models import Group
# Register your models here.

from .models import Crime

admin.site.site_header = 'Administration du système'

admin.site.register(Crime)


class CrimeAdmin (admin.ModelAdmin):
    list_display = ('Primary_Type', 'Arrest')
    list_filter = ('Primary_Type')


admin.site.unregister(Group)
