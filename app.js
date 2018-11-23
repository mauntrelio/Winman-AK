var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var swig = require('swig-templates');

var config = require('./config/default.json');
var secrets = require('./config/secrets.json');
var utils = require('./lib/utils');
var router = require('./routes/index');
var apiRouter = require('./routes/apis');

var app = express();

app.locals.config = config;
app.locals.config.publicKey = secrets.vapidKeys.publicKey;

app.locals.basedir = __dirname;

// view engine setup
app.engine('html', swig.renderFile);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.set('view cache', false);
swig.setFilter('sanitize', utils.sanitize);
swig.setDefaults({ cache: false });
app.set('json spaces', 4);

// other middle layers
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// our standard middle layer
app.use(function(req,res,next){
  var now = new Date();
  app.locals.today = now.getDate();
  app.locals.month = now.getMonth();
  next();
});

app.use('/', router);
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404, "Not found!"));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('pages/error');
});

module.exports = app;
