
var req= $.getJSON('data/', function (data) {
    makeGraphs(data);
})


function makeGraphs(records) {

    //var parseTime = d3.timeParse("%Y-%m-%d");
    var parseTime = d3.timeParse("%m/%d/%Y");
    records.forEach(function (d) {

        d["d"] = parseTime(d["d"]);

    });

    var ndx = crossfilter(records);

    //Define Dimensions
    var dateDim = ndx.dimension(function (d) { return d["d"];});
    var crimeTypeDim = ndx.dimension(function (d) { return d["Primary Type"];});
    var arrestDim = ndx.dimension(function(d){return d["Arrest"];});
    var allDim = ndx.dimension(function (d) {return d;});
    var geoDim = ndx.dimension(function (d) {
        var x = d['Latitude']+','+d['Longitude'];
        return x;
    })

    var dayOfWeek = ndx.dimension(function (d) {

        var day = d["d"].getDay();
        var name = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return  name[day];
    });
    var dayOfWeekGroup = dayOfWeek.group();


    //Group data
    var numRecordsByDate = dateDim.group();
    var arrestGroup = arrestDim.group();
    var crimeTypeGroup = crimeTypeDim.group();
    var all = ndx.groupAll();
    var geoGroup = geoDim.group();



    //Define Values
    var minDate = dateDim.bottom(1)[0]["d"];
    var maxDate = dateDim.top(1)[0]["d"];




    //Charts
    var numberRecordsND = dc.numberDisplay("#number-records");
    var timeChart = dc.lineChart("#time-chart");
    //var arrestChart = dc.rowChart("#arrest");
    var arrestChart = dc.pieChart("#arrest");
    var crimeTypeChart = dc.rowChart("#crime-type");
    var crimeMap = dc.leafletMarkerChart("#map2");
    var topCrimes = dc.pieChart("#top-crimes");
    var dayOfWeekChart = dc.rowChart('#day-of-week-chart');


    numberRecordsND
        .formatNumber(d3.format("d"))
        .valueAccessor(function (d) {return d;})
        .group(all);

    timeChart
        .width(800)
        .height(250)
        .dimension(dateDim)
        .group(numRecordsByDate)
        .transitionDuration(500)
        .x(d3.scaleTime().domain([minDate, maxDate]))
        .elasticY(true)
        .yAxisLabel("number of crimes")
        .xAxisLabel("timeline")
        .turnOnControls(true)
        .renderHorizontalGridLines(true)
        .filterPrinter(function (filters) {
                        var filter = filters[0], s = "";
                        var dateObj = new Date(filter[0]);
                        var dateObj1 = new Date(filter[1]);
                            s += dateObj.getDate()+"/"+(dateObj.getMonth()+1)+"/"+ (dateObj.getFullYear()) + " - " +
                            dateObj1.getDate()+"/"+(dateObj1.getMonth()+1)+"/"+ (dateObj1.getFullYear());
                        return s;
                    })
        .yAxis().ticks(4);


   /*arrestChart
        .width(300)
        .height(100)
        .dimension(arrestDim)
        .group(arrestGroup)
        .ordering(function(d) { return -d.value })
        .colors(['#6baed6'])
        .elasticX(true)
        .xAxis().ticks(4);*/

   arrestChart
        .width(200)
        .height(200)
        .slicesCap(4)
        .innerRadius(40)
        .dimension(arrestDim)
        .group(arrestGroup)
        .turnOnControls(true)
        .legend(dc.legend())
        .on('pretransition', function(chart) {
        chart.selectAll('text.pie-slice').text(function(d) {
            return d.data.key + ' ' + dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2*Math.PI) * 100) + '%';
        })
         });

   topCrimes
       .width(250)
       .height(250)
       .slicesCap(4)
       .innerRadius(50)
       .dimension(crimeTypeDim)
       .group(crimeTypeGroup)
       .slicesCap(4)
       .on('pretransition', function(chart) {
       chart.selectAll('text.pie-slice').text(function(d) {
            return d.data.key + ' ' + dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2*Math.PI) * 100) + '%';
       })
        });
    var numberOfTypes=0;
    numberOfTypes = crimeTypeGroup.all().length+1;
    console.log(numberOfTypes*30);

    crimeTypeChart
        .height(numberOfTypes*30)
        .margins({top: 10, right: 50, bottom: 30, left: 10})
        .dimension(crimeTypeDim)
        .group(crimeTypeGroup)
        .ordering(function(d) { return -d.value })
        .gap(2)
        //.rowsCap(5)//to limit the number of rows you wanna display
        //.fixedBarHeight(25)
        .elasticX(false)
        .turnOnControls(true)
        .ordinalColors(['rgb(127,205,187)','rgb(65,182,196)','rgb(29,145,192)','rgb(34,94,168)','rgb(37,52,148)','rgb(8,29,88)'])
        .xAxis().ticks(5);

    crimeMap
        .dimension(geoDim)
        .group(geoGroup)
        .center([36.681,3.2])
        .fitOnRender(true)
        .fitOnRedraw(true)
        .cluster(true)
        .brushOn(false);

    dayOfWeekChart
        .margins({top: 20, left: 10, right: 10, bottom: 20})
        .group(dayOfWeekGroup)
        .dimension(dayOfWeek)

    var map = L.map('map');
    var drawMap = function () {
        map.setView([35.65, 3.3301],6);
        mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
        L.tileLayer(
			'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '&copy; ' + mapLink + ' Contributors',
				maxZoom: 15,
			}).addTo(map);



        //HeatMap
        var geoData = [];
        _.each(allDim.top(Infinity), function (d){

            geoData.push([d["Latitude"], d["Longitude"]]);
        });
        var heat = L.heatLayer(geoData, {
            radius: 10,
            blur: 20,
            maxZoom: 1,
        }).addTo(map);

        /*var normalMap = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '&copy; ' + mapLink + ' Contributors',
				maxZoom: 13,
			});

        var markers = L.markerClusterGroup();
        records.forEach(function (d) {
            var marker  = L.marker(new L.LatLng(d['Latitude'],d['Longitude']), {title: d['Primary Type']});
            marker.bindPopup(d['Primary Type']);
            markers.addLayer(marker);
        });
        map.addLayer(markers);*/

    };

    /*var map2 = L.map('map2');
    var drawMap2 = function () {
        map2.setView([41.864,-87.706],10);
        mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
         L.tileLayer(
			'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '&copy; ' + mapLink + ' Contributors',
				maxZoom: 15,
			}).addTo(map2);



        var markers = L.markerClusterGroup();
        records.forEach(function (d) {
            var marker  = L.marker(new L.LatLng(d['Latitude'],d['Longitude']), {title: d['Primary Type']});
            marker.bindPopup(d['Primary Type']);
            markers.addLayer(marker);
        });
        map2.addLayer(markers);

    };*/


    drawMap();
    //drawMap2();
   dcCharts = [timeChart, arrestChart, crimeTypeChart, crimeMap];

    _.each(dcCharts, function (dcChart) {
        dcChart.on("filtered", function(chart, filter){
            map.eachLayer(function (layer) {
                map.removeLayer(layer)
            });
            drawMap();
        });

    });

    dc.renderAll();
}
