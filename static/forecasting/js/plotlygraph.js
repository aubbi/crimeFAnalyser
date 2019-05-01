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
    price = records.crimes[i].y;
    x1.push({ date: new Date(records.crimes[i].ds) });
    y1.push({ price });
  }
  console.log(x1);
  var trace1 = {
    x: x1,
    y: y1,
    type: "scatter"
  };

  var trace2 = {
    x: [1, 2, 3, 4],
    y: [16, 5, 11, 9],
    type: "scatter"
  };

  var data = [trace1, trace2];

  Plotly.newPlot("myDiv", data, {}, { showSendToCloud: true });
}
