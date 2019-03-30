from django.shortcuts import render

# Create your views here.


def predictCrime(request):
    listOfCrimes = ['THEFT', 'BATTERY', 'CRIMINAL DAMAGE', 'ASSAULT', 'OTHER OFFENSE', 'NARCOTICS', 'DECEPTIVE PRACTICE',
                    'MOTOR VEHICLE THEFT', 'ROBBERY', 'BURGLARY', 'CRIMINAL TRESPASS', 'WEAPONS VIOLATION',
                    'OFFENSE INVOLVING CHILDREN', 'PUBLIC PEACE VIOLATION', 'CRIME SEXUAL ASSAULT', 'HOMOCIDE',
                    'PROSTITUION', 'SEX OFFENSE', 'INTERFEREENCE WITH PUBLIC OFFICER', 'KIDNAPPING', 'ARSON', 'GAMBLING',
                    'INTIMIDATING', 'LIQUOR LAW VIOLATION', 'STALKING']
    context = {
        'crimes': listOfCrimes
    }
    return render(request, 'predict/sample.html', context)
