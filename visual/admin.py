from django.contrib import admin
from django.contrib.auth.models import Group

# Register your models here.

from .models import Crime
from users.models import Settings

admin.site.site_header = 'Administration du système'

admin.site.register(Crime)
admin.site.register(Settings)


class CrimeAdmin (admin.ModelAdmin):
    list_display = ('Primary_Type', 'Arrest')
    list_filter = ('Primary_Type')


admin.site.unregister(Group)
