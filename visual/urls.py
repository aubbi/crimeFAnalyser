from django.conf.urls import url
from django.urls import path
from . import views



urlpatterns = [
    path('home/', views.index, name='index'),
    url(r'getData', views.getData, name="getData"),
    url(r'data/', views.default),
]