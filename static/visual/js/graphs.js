

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
    var districtDim = ndx.dimension(function (d) {return d["District"]});
    var allDim = ndx.dimension(function (d) {return d;});
    var geoDim = ndx.dimension(function (d) {
        var x = d['Latitude']+','+d['Longitude'];
        return x;
    });

    var dayOfWeek = ndx.dimension(function (d) {
        var day = d["Date"].getDay();
        var name = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        return  name[day];
    });

    var dayOfWeekGroup = dayOfWeek.group();


    //Group data
    var numRecordsByDate = dateDim.group();
    var arrestGroup = arrestDim.group();
    var crimeTypeGroup = crimeTypeDim.group();
    var districtGroup = districtDim.group();
    var all = ndx.groupAll();
    //var geoGroup = geoDim.group();
    var geoGroup = geoDim.group().reduce(
            function(p, v) {
              p.Primary_Type = v.Primary_Type;
              p.Arrest = v.Arrest;
              p.Location_Description = v.Location_Description;
              p.Case_Number = v.Case_Number;
              p.Code_Penal = v.Code_Penal;
              p.Date = v.Date;
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
    var districtsChart = dc.barChart("#district-chart");


    numberRecordsND
        .formatNumber(d3.format("d"))
        .valueAccessor(function (d) {return d;})
        .group(all);


    timeChart
        .width(900)
        .height(300)
        .dimension(dateDim)
        .group(numRecordsByDate)
        .transitionDuration(500)
        .x(d3.scaleTime().domain([minDate, maxDate]))
        .elasticY(true)
        .elasticX(true)
        .yAxisLabel("nombre d'infractions")
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
        //.ordinalColors(['rgb(127,205,187)','rgb(65,182,196)','rgb(29,145,192)','rgb(34,94,168)','rgb(37,52,148)','rgb(8,29,88)'])
        .xAxis().ticks(5);

    districtsChart
        .margins({top: 0, right: 0, bottom: 20, left: 40})
        .x(d3.scaleBand())
        .xUnits(dc.units.ordinal)
        .brushOn(false)
        .dimension(districtDim)
        .xAxisLabel('Region')
        .yAxisLabel('Nombre d infraction')
        .barPadding(0.1)
        .elasticY(true)
        .outerPadding(0.05)
        .group(districtGroup);

    crimeMap
        .dimension(geoDim)
        .group(geoGroup)
        .center([41.8781,-87.6298])
        .zoom(9)
        .valueAccessor(d => d.value['Date']
                    +", Type:"+d.value['Primary_Type']
                    +", Arrest : "+ d.value['Arrest']
                    +", Description du lieu:  "+ d.value['Location_Description']
                    +", Numero du cas:  "+ d.value['Case_Number']
                    +", Code penal:  "+ d.value['Code_Penal'])
        .fitOnRender(false)
        .fitOnRedraw(false)
        .cluster(true)
        .filterByArea(true)
        .brushOn(false);

    dayOfWeekChart
        .height(250)
        .margins({top: 20, left: 10, right: 10, bottom: 20})
        .group(dayOfWeekGroup)
        .dimension(dayOfWeek)
        .elasticX(true);

    var map = L.map('map');
    var drawMap = function () {
        map.setView([41.8781,-87.6298],9);
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

        var printer = L.easyPrint({
      		title:'this is a title',
      		sizeModes: ['Current', 'A4Landscape', 'A4Portrait'],
      		filename: 'heatMap',
      		exportOnly: true,
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



    drawMap();
    //drawMap2();
   dcCharts = [timeChart, arrestChart, crimeTypeChart, crimeMap, districtsChart, dayOfWeekChart];

    _.each(dcCharts, function (dcChart) {
        dcChart.on("filtered", function(chart, filter){
            map.eachLayer(function (layer) {
                map.removeLayer(layer)
            });
            drawMap();
        });

    });

    //dc.renderAll();

    /*window.addEventListener('resize', function () {
        dc.renderAll();

    })*/

    d3.select('#download-csv')
        .on('click', function () {
            var data = allDim.top(Infinity);
            var blob = new Blob([d3.csvFormat(data)], {type: "text/csv;charset=utf-8"});
            saveAs(blob, 'data.csv');
        })

    return [dc, ndx, dcCharts];
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
              p.Location_Description = v.Location_Description;
              p.Case_Number = v.Case_Number;
              p.Code_Penal = v.Code_Penal;
              p.Date = v.Date;
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
            .center([41.8781,-87.6298])
            .fitOnRender(true)
            //.valueAccessor(d => d.value['Primary_Type'])
            .valueAccessor(d => d.value['Date']
                    +", Type:"+d.value['Primary_Type']
                    +", Arrest : "+ d.value['Arrest']
                    +", Description du lieu:  "+ d.value['Location_Description']
                    +", Numero du cas:  "+ d.value['Case_Number']
                    +", Code penal:  "+ d.value['Code_Penal'])
            /*.popup(function (d, marker) {
                var text = d.value['Date']
                    +", Type:"+d.value['Primary_Type']
                    +", Arrest : "+ d.value['Arrest']
                    +", Description du lieu:  "+ d.value['Location_Description']
                    +", Numero du cas:  "+ d.value['Case_Number']
                    +", Code penal:  "+ d.value['Code_Penal'];
                return text;

            })*/
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
//added option to print the map
function makeHeatMap(records, rendered) {
    if(rendered){
        //heatMap.invalidateSize();
        heatMap.remove();

    };
    heatMap = L.map('map');
    //if(heatMap != undefined || heatMap != null)
    //adding print map fonctionality
    var printer = L.easyPrint({
      		tileLayer: 'something',
      		sizeModes: ['Current', 'A4Landscape', 'A4Portrait'],
      		filename: 'heatMap',
      		exportOnly: true,
		}).addTo(heatMap);



    var ndx = crossfilter(records);
    var total = ndx.groupAll();
    var allDim = ndx.dimension(function (d) {return d;});
        heatMap.setView([41.8781,-87.6298],8);
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

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.round(Math.random() * 15)];
    }
    return color;
}


function makeMapForClustering(regions, labels, k){

    var container = L.DomUtil.get('map-clusters');
      if(container != null){
        container._leaflet_id = null;
      }

    colors = [];
    for(var i=0; i<k;i++){
        colors[i] = getRandomColor();
    }


    mapForClusters = L.map('map-clusters');
    //if(heatMap != undefined || heatMap != null)
    //adding print map fonctionality
    var printer = L.easyPrint({
      		tileLayer: 'something',
      		sizeModes: ['Current', 'A4Landscape', 'A4Portrait'],
      		filename: 'heatMap',
      		exportOnly: true,
		}).addTo(mapForClusters);

     var geoJsonLayer = new L.GeoJSON.AJAX("/static/visual/b.geojson",
         {
         style: function (feature) {
             var district = feature.properties.dist_num;
             var index = regions.indexOf(parseInt(district));
             if(index !== -1){
                 var cluster = labels[index];
                //console.log(district, index, cluster, colors[cluster]);
                return {
                radius: 8,
				fillColor: colors[cluster],
				color: "#000",
				weight: 1,
				opacity: 1,
				fillOpacity: 0.8}
             }else return {fillColor: "#ff7800"}

         }},
         {
            onEachFeature: forEachFeature
         },
     );


     geoJsonLayer.addTo(mapForClusters);

        mapForClusters.setView([41.8781,-87.6298],10);
        mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
        L.tileLayer(
			'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '&copy; ' + mapLink + ' Contributors',
				maxZoom: 15,
			}).addTo(mapForClusters);


}


function forEachFeature(feature, layer) {
		var popupContent = "'<h1>'+ feature.properties.dist_num+'</h1>'";
		console.log(popupContent);

		if (feature.properties && feature.properties.popupContent) {
			popupContent += feature.properties.popupContent;
		}

		layer.bindPopup(popupContent);
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

    var chart = dc.seriesChart("#compareChart");

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

function makeClusteringResultsTable(records){

    //var html = "<tr class="text-white"><th scope="col">"+title+"</th></tr>"
    var html = '';
    var k = 1;
    for (var key in records){
        html +="<tr><th>"+ k +"</th><th>";
        x = records[key]
        for (i=0; i<x.length; i++){
            html+= x[i]+"; ";
        }
        html+= "</th>";
        k++;
    }

    return html;

}


      // this function will generate a png file of the element provided by ID and save it as as output_name.png
        function toPNG(id,output_name ) {
            var options = {};
            options.backgroundColor = '#ffffff';
            options.selectorRemap = function(s) { return s.replace(/\.dc-chart/g, ''); };
            var chart = document.getElementById(id).getElementsByTagName('svg')[0];
            saveSvgAsPng(chart, output_name+'.png', options)

        }

function allDataGraphs(records) {
    var parseTime = d3.timeParse("%m/%d/%Y");

    records.forEach(function (d) {
        d["Date"] = parseTime(d["Date"]);
        d.month = d3.timeMonth(d["Date"]);
    });

    var moveChart = dc.lineChart('#monthly-move-chart');//line chart for showing details
    var volumeChart = dc.barChart('#monthly-volume-chart');//bar chart to show resumed infos

    var ndx = crossfilter(records);
    //var all = ndx.groupAll();
    var allDim = ndx.dimension(function (d) {return d;});

    var dateDim = ndx.dimension(function (d) {
        return d["Date"];
    })



    var yearlyDimension = ndx.dimension(function (d) {
        return d3.timeYear(d["Date"]).getFullYear();
    });

    var moveMonths = ndx.dimension(function (d) {
        return d.month;
    });

    var volumeByMonthGroup = moveMonths.group().reduceSum(function (d) {
        return d['crimes_Count'];
    });




    moveChart /* dc.lineChart('#monthly-move-chart', 'chartGroup') */
        .renderArea(true)
        .width(990)
        .height(200)
        .transitionDuration(1000)
        .margins({top: 30, right: 50, bottom: 25, left: 40})
        .dimension(moveMonths)
        .mouseZoomable(true)
        .rangeChart(volumeChart)
        .x(d3.scaleTime().domain([new Date(2012, 1, 1), new Date(2017, 1, 1)]))
        .round(d3.timeMonth.round)
        .xUnits(d3.timeMonths)
        .elasticY(true)
        .renderHorizontalGridLines(true)
        .group(indexAvgByMonthGroup, 'Monthly Index Average')


    volumeChart.width(990) /* dc.barChart('#monthly-volume-chart', 'chartGroup'); */
        .height(40)
        .margins({top: 0, right: 50, bottom: 20, left: 40})
        .dimension(moveMonths)
        .group(volumeByMonthGroup)
        .centerBar(true)
        .gap(1)
        .x(d3.scaleTime().domain([new Date(2012, 1, 1), new Date(2017, 1, 1)]))
        .round(d3.timeMonth.round)
        .alwaysUseRounding(true)
        .xUnits(d3.timeMonths);


    dc.renderAll();

};

function makeSomething(records) {

    var parseTime = d3.timeParse("%Y-%m-%d");

    records.forEach(function (d) {
        d["Date"] = parseTime(d["Date"]);
        d.month = d3.timeMonth(d["Date"]);
        d["DistrictStr"] = d["District"].toString();
    });


    var moveChart = dc.lineChart('#monthly-move-chart');//line chart for showing details
    var volumeChart = dc.barChart('#monthly-volume-chart');//bar chart to show resumed infos
    var districtsChart = dc.barChart("#district-chart");
    var crimeTypeChart = dc.barChart("#type-chart");

    var ndx = crossfilter(records);


    var dateDim = ndx.dimension(function (d) {return d["Date"];})
    var moveMonths = ndx.dimension(function (d) {return d.month;});
    var crimeTypeDim = ndx.dimension(function (d) { return d["Primary_Type"];});
    var districtDim = ndx.dimension(function (d) {return d["DistrictStr"]});
    var minDate = dateDim.bottom(1)[0]["Date"];
    var maxDate = dateDim.top(1)[0]["Date"];

    var dateCount = dateDim.group().reduceSum(function (d) {return +d["crimes_Count"]});
    var countPerMonth = moveMonths.group().reduceSum(function(d){return +d["crimes_Count"]});
    var countPerType = crimeTypeDim.group().reduceSum(function(d){return +d["crimes_Count"]});
    var countPerRegion = districtDim.group().reduceSum(function () {return +["crimes_Count"]});


    moveChart /* dc.lineChart('#monthly-move-chart', 'chartGroup') */
        .width(990)
        .height(200)
        .transitionDuration(1000)
        .margins({top: 30, right: 50, bottom: 25, left: 40})
        .dimension(dateDim)
        .group(dateCount)
        .x(d3.scaleTime().domain([minDate, maxDate]))
        .round(d3.timeMonth.round)
        .xUnits(d3.timeMonths)
        .elasticY(true)
        .renderHorizontalGridLines(true)
        .rangeChart(volumeChart)

    volumeChart
        .width(990) /* dc.barChart('#monthly-volume-chart', 'chartGroup'); */
        .height(100)
        .margins({top: 0, right: 50, bottom: 20, left: 40})
        .dimension(moveMonths)
        .group(countPerMonth)
        .centerBar(true)
        .gap(1)
        .x(d3.scaleTime().domain([minDate, maxDate]))
        .round(d3.timeMonth.round)
        .alwaysUseRounding(true)
        .xUnits(d3.timeMonths);

    districtsChart
        .margins({top: 0, right: 0, bottom: 20, left: 40})
        .x(d3.scaleBand())
        .xUnits(dc.units.ordinal)
        .brushOn(false)
        .dimension(districtDim)
        .xAxisLabel('Region')
        .yAxisLabel('Nombre d infraction')
        .barPadding(0.1)
        .elasticY(true)
        .outerPadding(0.05)
        .group(countPerRegion);

    crimeTypeChart
        .margins({top: 0, right: 0, bottom: 20, left: 40})
        .x(d3.scaleBand())
        .xUnits(dc.units.ordinal)
        .brushOn(false)
        .dimension(crimeTypeDim)
        .xAxisLabel('Region')
        .yAxisLabel('Nombre d infraction')
        .barPadding(0.1)
        .elasticY(true)
        .outerPadding(0.05)
        .group(countPerType);


    volumeChart.render();
    moveChart.render();

}











