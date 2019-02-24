from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from django.template import loader
import pandas as pd
from visual.models import Crime


def index(request):
    template = loader.get_template('visual/index.html')
    context ={
        'var': "simple text",
    }
    return HttpResponse(template.render(context,request))

dateSelected = 2016
typesSelected = ['all']
def getData(request):
    global dateSelected
    dateSelected= request.POST['date']
    global typesSelected
    typesSelected = request.POST.getlist('crime_type')
    crime = Crime.objects.get(id=1)
    print(crime)
    return redirect('home/')


def getDataPerYear( year, types):
    df = pd.read_csv('data/./2016CrimesAlgiers.csv', nrows=1000)
    print(df.shape)
    #cols_to_keep = ['Date', 'Primary Type', 'Arrest', 'Longitude', 'Latitude']
    df = df.dropna()
    if 'all' not in types:
        df = df[df['Primary Type'].isin(types)]
    #df['d'] = pd.to_datetime(df.Date).dt.date.astype(str)
    #df['Date'] = pd.to_datetime(df.Date)
    #df = df[df.Date.dt.year == year]
    #df = df.drop('Date', axis= 1)
    return df.to_json(orient='records')

def default(request):
    print(dateSelected, typesSelected)
    return HttpResponse(getDataPerYear(dateSelected,typesSelected))

