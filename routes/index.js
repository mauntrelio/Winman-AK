var createError = require('http-errors');
var express = require('express');
var router = express.Router();
var utils = require('../lib/utils');


/* GET index calendar */
router.get('/', function(req, res, next) {
  res.render('pages/index', { config: req.app.locals.config });
});


/* GET offline. (fallback offline page for the service worker) */
router.get('/offline', function(req, res, next) {
  res.render('pages/offline', { config: req.app.locals.config });
});


/* GET Qrcode. */
router.get('/qr/:day([0-9]+)?', function(req, res, next) {
  var QRCode = require('qrcode');
  var day_asked = parseInt(req.params.day);
  text = req.app.locals.config.base_url;
  if (day_asked > 0 && day_asked < 25) {
    text += day_asked; 
  }
  QRCode.toFileStream(res, text, {scale: 6, errorCorrectionLevel: 'L'});  
});


/* GET ajax day. */
router.get('/ajax/:day([0-9]+)', function (req, res, next){
  var day_asked = parseInt(req.params.day);
  var today = req.app.locals.today;
  var month = req.app.locals.month;
  var result = {};
  var config = req.app.locals.config;

  if (day_asked <= 0 || day_asked >= 25) {
    res.status = 404;
    result = {
      "status": "ERROR",
      "message": "Bad day requested"
    };
  } else if (day_asked > today || month != 12) {    
    result = {
      "status": "ERROR",
      "message": config.messages.sorry.de + "<br><br>" + config.messages.sorry.it 
    }
  } else {
    // tell the service worker he can cache this page
    res.setHeader("X-Page-Status", "completed");
    result = {
      "status": "OK",
      "image": utils.sanitize(config.calendar[day_asked-1][1]),
      "text": config.calendar[day_asked-1][1]
    }
  } 

  res.json(result);

});


/* GET day page. */
router.get('/:day([0-9]+)', function (req, res, next){
  var day_asked = parseInt(req.params.day);
  var today = req.app.locals.today;
  var month = req.app.locals.month;

  if (day_asked <= 0) {
    page = 'index';
  } else if (day_asked < 0 || day_asked >= 25) {
    next(createError(404, "Not found!"));
  } else if (day_asked > today || month != 12) {
    page = 'sorry';   
  } else {
    // tell the service worker he can cache this page
    res.setHeader("X-Page-Status", "completed");
    page = 'day';
  }

  res.render('pages/' + page, { config: req.app.locals.config, day_asked: day_asked });

});

module.exports = router;
