var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
var fs = require('fs');
var request = require('request');
var cors = require('cors');
var url = require('url');
const async = require('async');
app.use(cors());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});




// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


app.get('/',function(req,rsp){


})



routes.get('/all',function(req,rsp) {

  console.log(req);
  var Jsonarr = req.query.dev;
  var urls = [];
  var timeInMss = Date.now();
  var n = timeInMss / 1000;
  var time = Math.floor(n) - 15000;
  var data = '';


  if (typeof Jsonarr === 'undefined' || Jsonarr === null) {
    // variable is undefined or null
  }
  else{
    var arr = JSON.parse(Jsonarr);

    for (var i = 0; i < arr.length; i++) {
      var url = 'http://webcharts.fxserver.com/charts/activeChartFeed.php?pair=' + arr[i] + '&period=0&unit=&limit=80&timeout=' + time + '&rateType=bid&GMT=on';
      urls.push(url);
    }
    var red = [];
    var completed_requests = 0;
    for (i in urls) {
      request(urls[i], function (error, response, html) {
        var s = JSON.parse(html);
        var json = { change : "", buy : "", sell : "",spread : "",stat : ""};
        var candle = s.candles;
        var data = candle.data;
        var value = data[0];
        json.change = s.pair ;
        json.spread = s.spread;
        json.buy = value.O;
        json.sell = value.C;
        var comp = data[2].O;
        var diff = value.O - comp ;
        console.log(diff);
        if(diff>0){
          json.stat = 0 ;
        }
        else{
          json.stat = 1;
        }
        red.push(json);
        completed_requests++;
        if (completed_requests == urls.length) {
          rsp.send(red);

        }
      });


    }


  }


})



routes.get('/byone',function(req,rsp) {

  var timeInMss = Date.now();
  var n = timeInMss / 1000;
  var time = Math.floor(n) - 15000;
  var data = '';
  var arr = req.query.dev;
  var url = 'http://webcharts.fxserver.com/charts/activeChartFeed.php?pair=' + arr + '&period=0&unit=&limit=80&timeout=' + time + '&rateType=bid&GMT=on';
  if (typeof arr === 'undefined' || arr === null) {
    // variable is undefined or null
  }
  else{


    request(url, function (error, response, html) {
      var s = JSON.parse(html);
      var json = { change : "", buy : "", sell : "",spread : "",stat : ""};
      var candle = s.candles;
      var data = candle.data;
      var value = data[0];
      json.change = s.pair ;
      json.spread = s.spread;
      json.buy = value.O;
      json.sell = value.C;
      var comp = data[2].O;
      var diff = value.O - comp ;
      console.log(diff);

      if(diff>0){
        json.stat = 0 ;
      }
      else{
        json.stat = 1;
      }
      rsp.send(json);


    });
  }









})



var port = Number (process.env.PORT || 3000)
app.listen(port, function(){
 
});












