from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from django.template import loader
import json
import numpy as np
import pandas as pd
from pandas import Series
from matplotlib import pyplot
from fbprophet import Prophet
import datetime
from visual.models import Crime
from django.db.models import Count

# Create your views here.


def predictCrimes(request):
    listOfCrimes = ['THEFT', 'BATTERY', 'CRIMINAL DAMAGE', 'ASSAULT', 'OTHER OFFENSE', 'NARCOTICS', 'DECEPTIVE PRACTICE',
                    'MOTOR VEHICLE THEFT', 'ROBBERY', 'BURGLARY', 'CRIMINAL TRESPASS', 'WEAPONS VIOLATION',
                    'OFFENSE INVOLVING CHILDREN', 'PUBLIC PEACE VIOLATION', 'CRIME SEXUAL ASSAULT', 'HOMOCIDE',
                    'PROSTITUION', 'SEX OFFENSE', 'INTERFEREENCE WITH PUBLIC OFFICER', 'KIDNAPPING', 'ARSON', 'GAMBLING',
                    'INTIMIDATING', 'LIQUOR LAW VIOLATION', 'STALKING']
    resolu = ['Resolu', 'Non resolu']
    listOfChapters = ['Actes menant ou destinés à causer une homicide', 'fdfd']

    type_Place = ['Appartement', 'Route', 'Etablissement', 'Local']
    motif = ['Revenge']
    context = {
        'crimes': listOfCrimes
    }
    return render(request, 'predict/forecast.html', context)


def makeForecast(request):

    types = request.POST.getlist('types[]')
    startDate = request.POST['startDate']
    endDate = request.POST['endDate']
    # arrest = request.POST['arrest']
    # rawData = Crime.objects.filter(Date__range=[startDate, endDate], Arrest__in=arrest, Primary_Type__in=types).\
    #     values('Date', 'Primary_Type').\
    #     annotate(crimes_Count=Count('id')).order_by('Date')
    df = pd.DataFrame(
        list(Crime.objects.filter(Date__range=[startDate, endDate], Primary_Type__in=types).values()))
    # df = pd.DataFrame(list(Crime.objects.all()[:200000].values()))
    data = pd.DataFrame(df['Date'].value_counts(sort=False).reset_index())
    data.columns = ['ds', 'y']
    crimes = data.sort_values(by='ds')
    crimes.reset_index(inplace=True)
    crimes['ds'] = crimes.ds.astype(str)
    # crimes['ds'] = crimes['ds'].dt.strftime('%Y-%m-%d')
    # for i in rawData.values():
    #     i['Date'] = i['Date'].strftime('%m/%d/%Y')
    #     result.append(i)

    # create a Prophet model
    m = Prophet()
    # # fit the dataframe to the Prophet model
    m.fit(crimes)
    # create a new period to forecast
    future = m.make_future_dataframe(periods=50)
    # making the forecast
    forecast = m.predict(future)
    forecast['ds'] = forecast.ds.astype(str)
    # return json content for our crimes data and forecast
    # print(forecast)
    # print('i am here')
    # result = json.dumps(result)
    crimes = crimes.to_dict(orient='records')
    forecast = forecast.to_dict(orient='records')
    # result = crimes.to_json(orient='records')
    return JsonResponse({'crimes': crimes, 'forecast': forecast})
