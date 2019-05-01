from django.conf.urls import url
from django.urls import path
from . import views


urlpatterns = [
    path('predict_type/', views.predictCrimes, name='showForecast'),
    url(r'^makeForecast', views.makeForecast, name="makeForecast"),
    path('predict_period/', views.predictCrimes, name='predict'),
    path('predict_region/', views.predictCrimes, name='predict'),
]
