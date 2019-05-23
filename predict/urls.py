from django.conf.urls import url
from django.urls import path
from . import views


urlpatterns = [
    path('predict_prophet/', views.predictCrimes, name='showForecast'),
    url(r'^makeForecast', views.makeForecast, name="makeForecast"),
    path('other_forecasts/', views.makeOtherForecasts, name='makeOtherForecasts'),
    url(r'^makeOtherForecast', views.makeOtherForecasts, name="makeOtherForecasts"),
    path('predict_period/', views.predictCrimes, name='predict'),
    path('predict_region/', views.predictCrimes, name='predict'),
]
