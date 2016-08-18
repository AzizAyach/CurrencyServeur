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


  var Jsonarr = req.query.dev;
  console.log(Jsonarr);
  var urls = [];
  var timeInMss = Date.now();
  var n = timeInMss / 1000;
  var time = Math.floor(n) - 15000;
  var data = '';
  var erreur = [] ;

  if (typeof Jsonarr === 'undefined' || Jsonarr === null) {
    rsp.send(erreur);
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
       try{
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
       }
       catch (error){



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
  var erreur = []
  var url = 'http://webcharts.fxserver.com/charts/activeChartFeed.php?pair=' + arr + '&period=0&unit=&limit=80&timeout=' + time + '&rateType=bid&GMT=on';
  if (typeof arr === 'undefined' || arr === null) {
    rsp.send(erreur);
  }
  else{


    request(url, function (error, response, html) {
      var s = JSON.parse(html);
      var json = { change : "", buy : "", sell : "",spread : "",stat : ""};
      try{
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
      }
      catch (error){

        
      }
      rsp.send(json);


    });
  }









})

routes.get('/async',function(req,rsp){

    var Jsonarr = req.query.dev;
    console.log(Jsonarr);
    var urls = [];
    var timeInMss = Date.now();
    var n = timeInMss / 1000;
    var time = Math.floor(n) - 15000;
    var data = '';
    var erreur = [] ;

    if (typeof Jsonarr === 'undefined' || Jsonarr === null) {
        rsp.send(erreur);
    }
    else {
        var arr = JSON.parse(Jsonarr);

        for (var i = 0; i < arr.length; i++) {
            var url = 'http://webcharts.fxserver.com/charts/activeChartFeed.php?pair=' + arr[i] + '&period=0&unit=&limit=80&timeout=' + time + '&rateType=bid&GMT=on';
            urls.push(url);
        }
    }
    var red = [];
    async.map(urls, function(url, callback) {
        // iterator function
        request(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var s = JSON.parse(body);
                var json = { change : "", buy : "", sell : "",spread : "",stat : ""};
                try{
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
                }
                catch (error){



                }
                red.push(json);
                callback(null, body);
            } else {
                callback(error || response.statusCode);
            }
        });
    }, function(err, results) {
       rsp.send(red);
        if (!err) {
            // process all results in the array here
            console.log(results);
            for (var i = 0; i < results.length; i++) {
                // do something with results[i]
            }
        } else {
            // handle error here
        }
    });



})



routes.get('/getchart',function(req,rsp){

    var Jsonarr = req.query.dev;
    console.log(Jsonarr);
    var urls = [];
    var timeInMss = Date.now();
    var n = timeInMss / 1000;
    var time = Math.floor(n) - 15000;
    var data = '';
    var erreur = [] ;

    if (typeof Jsonarr === 'undefined' || Jsonarr === null) {
        rsp.send(erreur);
    }
    else {
        var arr = JSON.parse(Jsonarr);

        for (var i = 0; i < arr.length; i++) {
            var url = 'http://webcharts.fxserver.com/charts/activeChartFeed.php?pair=' + arr[i] + '&period=0&unit=&limit=80&timeout=' + time + '&rateType=bid&GMT=on';
            urls.push(url);
        }
    }
    var red = [];
    async.map(urls, function(url, callback) {
        // iterator function
        request(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var s = JSON.parse(body);


                 red.push(JSON.stringify(s));
                callback(null, body);
            } else {
                callback(error || response.statusCode);
            }
        });
    }, function(err, results) {

        if (!err) {
            rsp.send(red);
            console.log(results);
            for (var i = 0; i < results.length; i++) {
                // do something with results[i]
            }
        } else {
            // handle error here
        }
    });


})

routes.get('/putchart',function(req,rsp){




})

var port = Number (process.env.PORT || 3000)
app.listen(port, function(){
 
});










