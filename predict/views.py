import os
import shutil
import uuid

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

import matplotlib.pyplot as plt

listofCrimesGlobal = ['Agression', 'Violation de l ordre publique', 'Vol', 'Infractions relative aux armes',
                      'Vol de vehicule a  moteur', 'Autre infraction', 'Pratique deceptive', 'Dommage criminel', 'Transgression penale', 'Cambriolage',
                      'Harcelement', 'Agression sexuelle', 'Narcotique', 'Infraction sexuelle', 'Autre', 'Infraction d enfants', 'Kidnapping', 'Jeu d argent', 'Incendie volontaire',
                      'Violation des liee a l alcool', 'Obscenite', 'Non penal', 'indecence publique', 'Trafic humain', 'Violation de licence de trasport', 'Autre violation narcotique']


# Create your views here.


def predictCrimes(request):

    type_Place = ['Appartement', 'Route', 'Etablissement', 'Local']
    motif = ['Revenge']
    context = {
        'crimes': listofCrimesGlobal
    }
    return render(request, 'predict/forecast.html', context)


def makeForecast(request):

    # remove the directory to clear the files
    shutil.rmtree('static/visual/images/graphs')
    # recreate the folder
    os.mkdir('static/visual/images/graphs')

    types = request.POST.getlist('types[]')
    startDate = request.POST['startDate']
    endDate = request.POST['endDate']

    period = 10

    # Fetching post request variables

    # growth = request.POST['endDate'] = request.POST['']
    # holidays = request.POST.getlist('holidays[]')
    # fourier_order_weekly = request.POST['fourier_order']
    # fourier_order_yearly = request.POST['']
    # seasonality_mode = request.POST['']
    # seasonality_prior_scale = request.POST['']
    # annual_seasonality = request.POST['']
    # weekly_seasonality = request.POST['']
    # daily_seasonality = request.POST['']

    # arrest = request.POST['arrest']
    # rawData = Crime.objects.filter(Date__range=[startDate, endDate], Arrest__in=arrest, Primary_Type__in=types).\
    #     values('Date', 'Primary_Type').\
    #     annotate(crimes_Count=Count('id')).order_by('Date')
    df = pd.DataFrame(
        list(Crime.objects.filter(Date__range=[startDate, endDate], Primary_Type__in=types).values()))
    # df = pd.DataFrame(list(Crime.objects.all().values()))
    data = pd.DataFrame(df['Date'].value_counts(sort=False).reset_index())
    data.columns = ['ds', 'y']
    crimes = data.sort_values(by='ds')
    crimes.reset_index(inplace=True)
    crimes['ds'] = crimes.ds.astype(str)
    m = Prophet()
    m.fit(crimes)
    future = m.make_future_dataframe(periods=int(period))
    # making the forecast
    forecast = m.predict(future)
    #forecast['ds'] = forecast.ds.astype(str)
    # Plotting the trend and yearly trend, converting it to a picture

    # days = (pd.date_range(start='2017-01-01', periods=365) + pd.Timedelta(days=0))
    # df_y = m.seasonality_plot_df(days)
    # seas = m.predict_seasonal_components(df_y)

    # fig,ax = plt.subplots(2, 1, figsize=(14,8))
    # ax[0].plot(forecast['ds'].dt.to_pydatetime(), forecast['trend'])
    # ax[0].grid(alpha=0.5)
    # ax[0].set_xlabel('Années')
    # ax[0].set_ylabel('Tendance')
    # ax[1].set_ylabel('trend')
    # ax[1].plot(df_y['ds'].dt.to_pydatetime(), seas['yearly'], ls='-', c='#0072B2')
    # ax[1].set_xlabel('Day of year')
    # ax[1].set_ylabel('yearly')
    # ax[1].grid(alpha=0.5)

    # ax[1].plot(df_y['ds'].dt.to_pydatetime(), seas['yearly'], ls='-', c='#0072B2')
    # ax[1].set_xlabel('Day of year')
    # ax[1].set_ylabel('yearly')
    # ax[1].grid(alpha=0.5)

    # pathForecast = 'static/visual/images/graphs/forecast' + str(uuid.uuid4()) + '.png'
    # plt.savefig(pathForecast)
    # #to avoid an error with plt
    # plt.close('all')
    # #regrouping paths in one dictionary
    # paths = {'pathForecast': pathForecast}

    # return json content for our crimes data and forecast
    crimes = crimes.to_dict(orient='records')
    forecast = forecast.to_dict(orient='records')

    # , 'paths': json.dumps(paths)

    return JsonResponse({'crimes': crimes, 'forecast': forecast})


def makeOtherForecasts(request):

    return JsonResponse({'crimes': 1})


def showInstructions(request):

    return render(request, 'predict/instructions.html')
