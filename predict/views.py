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

listOfRegionsGlobal = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11',
                       '12', '13', '14', '15', '16', '17', '18', '19', '20', '22', '24', '25', '31']

listOfPlaceType = ['Appartement', 'Rue',
                   'Vehicule', 'Autre', 'Parking', 'Ecoles', 'Hopital', 'Restaurant/Cafe/Bar', 'Magasin', 'Gare', 'Banque', 'Stades', 'Hotel', 'Usine',
                   'Etablissement Etatique', 'Route', 'Lieu de culte', 'Aeroport', 'Rurale'
                   ]


# Create your views here.


def predictCrimes(request):

    type_Place = ['Appartement', 'Route', 'Etablissement', 'Local']
    motif = ['Revenge']
    context = {
        'crimes': listofCrimesGlobal,
        'regions': listOfRegionsGlobal,
        'places': listOfPlaceType
    }
    return render(request, 'predict/forecast.html', context)


def makeForecast(request):

    # # remove the directory to clear the files
    shutil.rmtree('static/visual/images/forecast')
    # # recreate the folder
    os.mkdir('static/visual/images/forecast')

    types = request.POST.getlist('types[]')
    regions = request.POST.getlist('regions[]')
    places = request.POST.getlist('places[]')
    startDate = request.POST['startDate']
    endDate = request.POST['endDate']
    arrest = request.POST.getlist('arrest[]')
    period = request.POST['period']
    places = request.POST.getlist('places[]')
    # FbProphet parameters
    linear = request.POST['linear']
    logistic = request.POST['logistic']
    modeAdditif = request.POST['modeAdditif']
    modeMultiplicatif = request.POST['modeMultiplicatif']
    valMax = request.POST['valMax']
    valMin = request.POST['valMin']
    ordreHebdomadaire = request.POST['ordreHebdomadaire']
    ordreAnnuel = request.POST['ordreAnnuel']
    changepointPriorScale = request.POST['changepointPriorScale']
    seasonalityPriorScale = request.POST['seasonalityPriorScale']

    # holidays = request.POST.getlist('holidays[]')

    # Filtering requested data
    df = pd.DataFrame(list(Crime.objects.filter(
        Date__range=[startDate, endDate], Primary_Type__in=types, District__in=regions, Arrest__in=arrest, Location_Description__in=places).values()))
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

    # size = round(len(crimes))
    # train = crimes.iloc[:-size, :]
    # test = crimes.iloc[-size:, :]
    # forecast_extract = forecast.iloc[size*0.9:size, ]
    # print(forecast_extract)
    # print(test)
    # print(len(test))
    # print(len(forecast_extract))
    # Calculate RMSE and MAPE using 10% of the dataset as a testing dataset

    # Plotting the forecast
    path_forecast = 'static/visual/images/forecast/Prophet_Forecast' + \
        str(uuid.uuid4()) + '.png'
    m.plot(forecast).savefig(path_forecast)
    path_components = 'static/visual/images/forecast/Prophet_Components' + \
        str(uuid.uuid4()) + '.png'
    m.plot_components(forecast).savefig(path_components)
    # rmse = np.sqrt(np.mean(np.square(test.y.values - forecast.yhat)))
    # mape = np.mean(np.abs(forecast.yhat - test.y.values)/np.abs(test.y.values))

    paths = {'path_forecast': path_forecast,
             'path_components': path_components}

    # return json content for our crimes data and forecast
    crimes = crimes.to_dict(orient='records')
    forecast = forecast.to_dict(orient='records')

    return JsonResponse({'crimes': crimes, 'forecast': forecast, 'paths': json.dumps(paths)})


def makeOtherForecasts(request):

    return JsonResponse({'crimes': 1})


def showInstructions(request):

    return render(request, 'predict/instructions.html')
