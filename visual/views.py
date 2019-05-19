import json

from django.core import serializers
from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from django.template import loader
import pandas as pd
import numpy as np
from visual.models import Crime
from django.db.models import Count
#from statsmodels.tsa.seasonal import seasonal_decompose
from django.contrib.auth.decorators import login_required

@login_required
def index(request):
    template = loader.get_template('visual/starter.html')
    context ={
        'var': "simple text",
    }
    return HttpResponse(template.render(context,request))

@login_required
def showMap(request):
    listOfCrimes = ['THEFT','BATTERY','CRIMINAL DAMAGE','ASSAULT','OTHER OFFENSE','NARCOTICS','DECEPTIVE PRACTICE',
                    'MOTOR VEHICLE THEFT','ROBBERY','BURGLARY','CRIMINAL TRESPASS','WEAPONS VIOLATION',
                    'OFFENSE INVOLVING CHILDREN','PUBLIC PEACE VIOLATION','CRIME SEXUAL ASSAULT','HOMOCIDE',
                    'PROSTITUION','SEX OFFENSE','INTERFEREENCE WITH PUBLIC OFFICER','KIDNAPPING','ARSON','GAMBLING',
                    'INTIMIDATING','LIQUOR LAW VIOLATION','STALKING']
    context = {
        'crimes': listOfCrimes
    }
    return render(request, 'visual/mapNormal.html', context)


@login_required
def showHeatMap(request):
    listOfCrimes = ['THEFT','BATTERY','CRIMINAL DAMAGE','ASSAULT','OTHER OFFENSE','NARCOTICS','DECEPTIVE PRACTICE',
                    'MOTOR VEHICLE THEFT','ROBBERY','BURGLARY','CRIMINAL TRESPASS','WEAPONS VIOLATION',
                    'OFFENSE INVOLVING CHILDREN','PUBLIC PEACE VIOLATION','CRIME SEXUAL ASSAULT','HOMOCIDE',
                    'PROSTITUION','SEX OFFENSE','INTERFEREENCE WITH PUBLIC OFFICER','KIDNAPPING','ARSON','GAMBLING',
                    'INTIMIDATING','LIQUOR LAW VIOLATION','STALKING']
    context = {
        'crimes': listOfCrimes
    }
    return render(request, 'visual/heatMap.html', context)


@login_required
def compareCrimes(request):
    listOfCrimes = ['THEFT','BATTERY','CRIMINAL DAMAGE','ASSAULT','OTHER OFFENSE','NARCOTICS','DECEPTIVE PRACTICE',
                    'MOTOR VEHICLE THEFT','ROBBERY','BURGLARY','CRIMINAL TRESPASS','WEAPONS VIOLATION',
                    'OFFENSE INVOLVING CHILDREN','PUBLIC PEACE VIOLATION','CRIME SEXUAL ASSAULT','HOMOCIDE',
                    'PROSTITUION','SEX OFFENSE','INTERFEREENCE WITH PUBLIC OFFICER','KIDNAPPING','ARSON','GAMBLING',
                    'INTIMIDATING','LIQUOR LAW VIOLATION','STALKING']
    context = {
        'crimes': listOfCrimes
    }
    return render(request, 'visual/comapre.html', context)


dateSelected = 2016
typesSelected = ['all']

def getData(request):
    global dateSelected
    dateSelected= request.POST['date']
    global typesSelected
    typesSelected = request.POST.getlist('crime_type')
    crime = Crime.objects.get(id=1)
    print('hello ',crime.Date, ' id =1')
    return redirect('home/')


def getDataPerYear( year, types):
    df = pd.read_csv('data/./2016CrimesAlgiers.csv', nrows=2000)
    #cols_to_keep = ['Date', 'Primary Type', 'Arrest', 'Longitude', 'Latitude']
    df = df.dropna()
    if 'all' not in types:
        df = df[df['Primary Type'].isin(types)]
    #df['d'] = pd.to_datetime(df.Date).dt.date.astype(str)
    #df['Date'] = pd.to_datetime(df.Date)
    #df = df[df.Date.dt.year == year]
    #df = df.drop('Date', axis= 1)
    return df.to_json(orient='records')

def filterData(request):
    types = request.POST.getlist('types[]')
    startDate = request.POST['startDate']
    endDate = request.POST['endDate']
    arrest = request.POST.getlist('arrest[]')
    print(startDate, endDate, arrest, types)
    rawData = Crime.objects.filter(Date__range=[startDate, endDate], Arrest__in=arrest, Primary_Type__in=types)
    result = []
    for i in rawData.values():
        i['Date'] = i['Date'].strftime('%m/%d/%Y')
        result.append(i)


    #for record in rawData:
        #json_obj = dict(date = record.Date, arrest= record.Arrest, type= record.Primary_Type)
        #result.append(json_obj)

    #response = serializers.serialize('json',result)
    #return HttpResponse(json.dumps(json_obj),content_type='application/json')

    #return HttpResponse(rawData, content_type='application/json')

    return HttpResponse(json.dumps(result))

def customFilter(request):
    types = request.POST.getlist('types[]')
    startDate = request.POST['startDate']
    endDate = request.POST['endDate']
    arrest = request.POST.getlist('arrest[]')
    rawData = Crime.objects.filter(Date__range=[startDate, endDate], Arrest__in=arrest, Primary_Type__in=types).\
        values('Date','Primary_Type').\
        annotate(crimes_Count=Count('id')).order_by('Date')

    result = []
    for i in rawData:
        i['Date'] = i['Date'].strftime('%m/%d/%Y')
        result.append(i)

    myDict = {}
    for i in types:
        myDict[i]= []

    dfGlobal = pd.DataFrame(result)

    for index, row in dfGlobal.iterrows():
        myDict[row['Primary_Type']].append(row['crimes_Count'])
    toDelete = []


    for element in myDict:
        if not myDict[element]:
            toDelete.append(element)

    if toDelete:
        for x in toDelete:
            myDict.pop(x)

    sizes = []
    for element in myDict:
        sizes.append(len(myDict[element]))
    minSize = min(sizes)

    resultCorr = {}
    myDict1 =myDict.copy()
    #finding correlation using numpy
    for c in myDict:
        myDict1.pop(c)
        for l in myDict1:
            a = np.array(myDict[l])[0:minSize-1]
            b = np.array(myDict[c])[0:minSize-1]
            resultCorr[c+' <> '+l] = np.corrcoef(a,b)[0][1]

    #for serie in myDict:
        #resultTrend = seasonal_decompose(serie, model='additive')
        #print(resultTrend.trend)

    return HttpResponse(json.dumps({'result':result, 'corr':resultCorr}))

#get insights from timeseries data
def findInsightsTS(request):
    types = request.POST.getlist('types[]')
    startDate = request.POST['startDate']
    endDate = request.POST['endDate']
    arrest = request.POST.getlist('arrest[]')
    rawData = Crime.objects.filter(Date__range=[startDate, endDate], Arrest__in=arrest, Primary_Type__in=types). \
        values('Date'). \
        annotate(crimes_Count=Count('id')).order_by('Date')
    result = []
    for i in rawData:
        i['Date'] = i['Date'].strftime('%m/%d/%Y')
        result.append(i)
    df = pd.DataFrame(result)
    df.set_index('Date')
    print(df)
    return HttpResponse('hello')


def default(request):
    print(dateSelected, typesSelected)
    return HttpResponse(getDataPerYear(dateSelected,typesSelected))

def defaultHome(request):

    rawData = Crime.objects.filter(Date__range=['2016-01-01', '2016-12-31']).order_by('Date')[:2000]
    result = []
    for i in rawData.values():
        i['Date'] = i['Date'].strftime('%m/%d/%Y')
        result.append(i)
    return HttpResponse(json.dumps(result))
