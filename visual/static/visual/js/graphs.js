

function makeGraphs(records) {

    //var parseTime = d3.timeParse("%Y-%m-%d");
    var parseTime = d3.timeParse("%m/%d/%Y");

    records.forEach(function (d) {
        d["Date"] = parseTime(d["Date"]);
    });

    var ndx = crossfilter(records);

    //Define Dimensions
    var dateDim = ndx.dimension(function (d) { return d["Date"];});
    var crimeTypeDim = ndx.dimension(function (d) { return d["Primary_Type"];});
    var arrestDim = ndx.dimension(function(d){return d["Arrest"];});
    var allDim = ndx.dimension(function (d) {return d;});
    var geoDim = ndx.dimension(function (d) {
        var x = d['Latitude']+','+d['Longitude'];
        return x;
    });

    var dayOfWeek = ndx.dimension(function (d) {
        var day = d["Date"].getDay();
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
    var minDate = dateDim.bottom(1)[0]["Date"];
    var maxDate = dateDim.top(1)[0]["Date"];




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

    /*var timelineHeight = window.innerHeight, timelineWidth = window.innerWidth *0.75;
     window.addEventListener('resize', function(){
        //timelineHeight =  document.getElementById('timeline-container').offsetHeight; timelineWidth = document.getElementById('timeline-container').offsetWidth;

        timelineWidth = window.innerWidth *0.75;
        timelineHeight = window.innerHeight;
        console.log(timelineWidth*0.75);
     });*/

    timeChart
        .width(900)
        .height(300)
        .dimension(dateDim)
        .group(numRecordsByDate)
        .transitionDuration(500)
        .x(d3.scaleTime().domain([minDate, maxDate]))
        .elasticY(true)
        .yAxisLabel("number of crimes")
        .xAxisLabel("timeline")
        .turnOnControls(true)
        .brushOn(true)
        .valueAccessor(function (d) {
            return d.value;
        })
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

    //apply_resizing(timeChart,0.7,0.35, 50, 50);


   /*arrestChart
        .width(300)
        .height(100)
        .dimension(arrestDim)
        .group(arrestGroup)
        .ordering(function(d) { return -d.value })
        .colors(['#6baed6'])
        .elasticX(true)
        .xAxis().ticks(4);*/

    /*var containerHeight=240, containerWidth=220;

    window.addEventListener('resize', function(){
        containerHeight =  document.getElementById('pie-chart-container').clientHeight; containerWidth = document.getElementById('pie-chart-container').clientWidth;
    });*/

  //var adjustX = 20, adjustY = 40;

   arrestChart
        .width(200)
        .height(250)
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

    //apply_resizing(arrestChart, 20, 40);

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

    crimeTypeChart
        .height(24*30)
        .margins({top: 10, right: 50, bottom: 30, left: 10})
        .dimension(crimeTypeDim)
        .group(crimeTypeGroup)
        .ordering(function(d) { return -d.value })
        .gap(2)
        .rowsCap(20)//to limit the number of rows you wanna display
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
        .height(250)
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

    /*window.addEventListener('resize', function () {
        dc.renderAll();

    })*/
}
//this makes the normal map with markers clustered
function makeMap(records, id){
    var crimeMap = dc.leafletMarkerChart("#"+id);
        var ndx = crossfilter(records);

        var geoDim = ndx.dimension(function (d) {
            return d['Latitude']+','+d['Longitude'];

        });

        var geoGroup = geoDim.group().reduce(
            function(p, v) {
              p.Primary_Type = v.Primary_Type;
              p.Arrest = v.Arrest;
              ++p.count;
              return p;
          },
          function(p, v) {
              --p.count;
              return p;
          },
          function() {
              return {count: 0};
          }
                );


        crimeMap
            .dimension(geoDim)
            .group(geoGroup)
            .center([36.681,3.2])
            .fitOnRender(true)
            .valueAccessor(d => d.value['Primary_Type'])
            .popup(function (d, marker) {

                return d.value['Primary_Type']+ ', Arrest : '+ d.value['Arrest'];
            })
            /*.icon(function(d,map) {
                var iconUrl;
                console.log('hello babe');
                console.log(d.value.Primary_Type);
                switch (d.value['Primary_Type']) {
                    case 'CRIMINAL DAMAGE':
                        iconUrl = 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png';
                        break;
                    case 'ASSAULT':
                        iconUrl = 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png';
                        break;
                    case 'OTHER OFFENSE':
                        iconUrl = 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png';
                        break;
                    default:
                        return new L.Icon.Default();
                }
                return new L.Icon({
                    iconUrl: iconUrl,
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png'
                });
            })*/
            .fitOnRedraw(true)
            .cluster(true);
       crimeMap.render();

};


//this make a map with a different markers for each type of crime
/*function makeMap(records, id){
    var crimeMap = dc.leafletCustomChart("#"+id);
        var ndx = crossfilter(records);

        var geoDim = ndx.dimension(function (d) {
            return [d.Primary_Type, d['Latitude']+','+d['Longitude']];

        });

        var geoGroup = geoDim.group().reduce(
            function(p, v) {
              p.Primary_Type = v.Primary_Type;
              p.Arrest = v.Arrest;
              ++p.count;
              return p;
          },
          function(p, v) {
              --p.count;
              return p;
          },
          function() {
              return {count: 0};
          }
                );

        var markers = {};
        crimeMap
            .dimension(geoDim)
            .group(geoGroup)
            .center([36.681,3.2])
            .zoom(7)
            .renderItem(function(chart, map, d, i) {

                      var icon = null;

                      if (d.value.Primary_Type === 'CRIMINAL DAMAGE') {
                          icon = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
                      } else if (d.value.Primary_Type === 'ASSAULT') {
                          icon = 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png';
                      } else if (d.value.Primary_Type === 'OTHER OFFENSE') {
                          icon = 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png';
                      }else if (d.key[0] === 'NARCOTICS') {
                          icon = 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
                      } else if (d.key[0] === 'DECEPTIVE PRACTICE') {
                          icon = 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
                      } else {
                          icon = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
                      }
                      var marker = new L.Marker(chart.toLocArray(d.key[1]), {
                          title: d.key[0] + " : " + d.value,
                          alt: d.key[0] + " : " + d.value,
                          icon: new L.icon({
                              iconUrl: icon,
                              iconSize: [25, 25],
                              className: 'dot'
                          }),
                      });
                      marker.addTo(map);

                      markers[i] = marker;
                  })
                  .redrawItem(function(chart, map, d, i) {
                      markers[i].setOpacity(d.filtered ? 0 : 1);
                  });



        dc.renderAll();

};*/

//this makes the heat map and updates it when using the filters.

function makeHeatMap(records, rendered) {
    if(rendered){
        //heatMap.invalidateSize();
        heatMap.remove();

    };
    heatMap = L.map('map');
    //if(heatMap != undefined || heatMap != null)
    var ndx = crossfilter(records);
    var total = ndx.groupAll();
    var allDim = ndx.dimension(function (d) {return d;});
        heatMap.setView([35.65, 3.3301],6);
        mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
        L.tileLayer(
			'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '&copy; ' + mapLink + ' Contributors',
				maxZoom: 15,
			}).addTo(heatMap);



        //HeatMap
        var geoData = [];
        _.each(allDim.top(Infinity), function (d){

            geoData.push([d["Latitude"], d["Longitude"]]);
        });
        var heat = L.heatLayer(geoData, {
            radius: 10,
            blur: 20,
            maxZoom: 1,
        }).addTo(heatMap);

        var numberRecords = dc.numberDisplay('#total-number');

        numberRecords
        .formatNumber(d3.format("d"))
        .valueAccessor(function (d) {return d;})
        .group(total);

        numberRecords.render();

};

//this for statistic insights from data
function groupArrayAdd(keyfn) {
      var bisect = d3.bisector(keyfn);
      return function(elements, item) {
          var pos = bisect.right(elements, keyfn(item));
          elements.splice(pos, 0, item);
          return elements;
      };
  }
  function groupArrayRemove(keyfn) {
      var bisect = d3.bisector(keyfn);
      return function(elements, item) {
          var pos = bisect.left(elements, keyfn(item));
          if(keyfn(elements[pos])===keyfn(item))
              elements.splice(pos, 1);
          return elements;
      };
  }
  function groupArrayInit() {
      return [];
  }


//end

function makeComparaison(records) {

    var chart = dc.seriesChart("#test");

    var ndx = crossfilter(records.result);
    var crimeDim = ndx.dimension(function (d) {
        return [d['Primary_Type'], new Date(d['Date'])];
    });

    var crimeOnlyDim = ndx.dimension(function(d){
        return d['Primary_Type'];
    });

    var crimeOnlyGroup = crimeOnlyDim.group();

    var reducer = reductio()
        .max(function(d){return d['crimes_Count'];})
        .min(true)
        .median(true)
        .count(true)
        .sum(function (d) {return d['crimes_Count'];})
        .avg(true);

    reducer(crimeOnlyGroup);

    var stats = crimeOnlyGroup.top(Infinity);

    document.getElementById('table-body').innerHTML= makeTable(stats);
    document.getElementById('table-body-corr').innerHTML= makeTableCorr(records.corr);

    var crimeGroupe = crimeDim.group().reduceSum(function (d) {
        return d['crimes_Count'];
    });

    var dateDim = ndx.dimension(function (d) { return d["Date"];});
    var dateGroup = dateDim.group();

    var minDate = dateDim.bottom(1)[0]["Date"];
    var maxDate = dateDim.top(1)[0]["Date"];
    document.getElementById('date-range').innerHTML = minDate +' - '+ maxDate;

     chart
         .chart(function (c) { return dc.lineChart(c).interpolate('cardinal') })
         .x(d3.scaleTime().domain([new Date(minDate), new Date(maxDate)]))
         .dimension(crimeDim)
         .group(crimeGroupe)
         .seriesAccessor(function (d) { return d.key[0]; })
         .keyAccessor(function (d) { return d.key[1]; })
         .brushOn(false)
         .valueAccessor(function (d) { return d.value; })
         //legend(dc.legend().x(350).y(350).itemHeight(13).gap(5).horizontal(1).legendWidth(140).itemWidth(70));
         .legend(dc.legend().x(window.innerWidth-250).y(0).itemHeight(10).gap(5));

    chart.render();
}

function makeTable(objects) {
    var html = '';
    for(var i=0;i<objects.length;i++){
        html+= "<tr><th>"+objects[i].key+"</th><th>"+objects[i].value.max+"</th><th>"
            +objects[i].value.min+"</th><th>"+objects[i].value.median+"</th><th>"
            +objects[i].value.sum+"</th><th>"+objects[i].value.avg.toFixed(2)+"</th></tr>";
    }
    return html;
}

function makeTableCorr(objects) {
    var html = '';

    for(var key in objects){
            html+="<tr><th>"+ key+"</th><th>"+ objects[key].toFixed(4)+"</th></tr>";
    }
    return html;
}
















