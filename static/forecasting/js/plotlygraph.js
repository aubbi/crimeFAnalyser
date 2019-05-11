Object.size = function(obj) {
  var size = 0,
    key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) size++;
  }
  return size;
};
function getSafe(fn, defaultVal) {
  try {
    return fn();
  } catch (e) {
    return defaultVal;
  }
}

function forecastAll(records) {
  var data = [];
  var x1 = [];
  var y1 = [];
  var x2 = [];
  var y2 = [];

  /* for (i = 0; i < Object.size(records.forecast); i++) {
        price = getSafe(() => records.crimes[i].y, 0);
        quantity = records.forecast[i].yhat;
        data.push({
            date: new Date(records.forecast[i].ds),
            price: price,
            quantity: quantity
        });
    } */

  for (i = 0; i < Object.size(records.crimes); i++) {
    number = records.crimes[i].y;
    date = records.crimes[i].ds;
    x1.push(date);
    y1.push(number);
  }
  var trace1 = {
    x: x1,
    y: y1,
    mode: "lines",
    type: "scatter"
  };

  for (i = 0; i < Object.size(records.forecast); i++) {
    number2 = records.forecast[i].yhat;
    date2 = records.forecast[i].ds;
    x1.push(date2);
    y1.push(number2);
  }

  var trace2 = {
    x: x2,
    y: y2,
    mode: "lines+markers",
    type: "scatter"
  };

  var data = [trace1, trace2];

  var layout = {
    xaxis: {
      type: "date",
      title: "January Weather"
    },
    yaxis: {
      title: "Daily Mean Temperature"
    },
    title: "2000 Toronto January Weather"
  };

  Plotly.newPlot("myDiv", data, layout, { showSendToCloud: true });
}
