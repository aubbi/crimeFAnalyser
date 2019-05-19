from django.db import models

class Stats(models.Model):
    Date = models.DateField()
    Type = models.TextField(max_length=300)
    Count = models.IntegerField()
    class Meta:
        managed = True
        db_table = 'stats_table'

class Crime(models.Model):

    #Case_Number = models.TextField(max_length=1000)
    Date = models.DateField()
    #Block = models.TextField(max_length=1000)
    #IUCR = models.IntegerField()
    Primary_Type = models.TextField(max_length=1000)
    #Description = models.TextField(max_length=1000)
    #Location_Description = models.TextField(max_length=1000)
    Arrest = models.BooleanField()
    #Domestic = models.TextField(max_length=1000)
    #Beat = models.IntegerField()
    #District = models.IntegerField()
    #Ward = models.IntegerField()
    #Community_Aarea = models.IntegerField()
    #FBI_code = models.TextField(max_length=100)
    #X_coordinate = models.IntegerField()
    #Y_coordinate = models.IntegerField()
    #Year = models.IntegerField()
    #Updated_on = models.DateTimeField()
    Latitude = models.FloatField()
    Longitude = models.FloatField()
    class Meta:
        managed = True
        db_table = 'crimes_table'

