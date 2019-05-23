from django.conf.urls import url
from django.urls import path
from . import views


urlpatterns = [
    path('home/', views.index, name='index'),
    url(r'getData', views.getData, name="getData"),
    url(r'data/', views.defaultHome),
    path('map/', views.showMap),
    path('heat-map/', views.showHeatMap),
    path('compare/', views.compareCrimes),
    path('cluster/', views.cluster),
    path('cluster-district/', views.cluster_district),
    url(r'^filterdata', views.filterData, name="filterData"),
    url(r'^customFilter', views.customFilter, name="customFilter"),
    url(r'^getInsights', views.findInsightsTS, name="findInsightsTS"),
    url(r'^makeKmeans', views.makeKmeans, name="kmeans"),
    url(r'clusterDistricts', views.clusterDistricts, name='districts'),
]
