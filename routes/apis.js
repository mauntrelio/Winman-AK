var createError = require('http-errors');
var Datastore = require('nedb');
var path = require('path');
var express = require('express');
var router = express.Router();

var utils = require('../lib/utils');
var secrets = require('../config/secrets.json');

const isValidSaveRequest = function(req, res) {
  // Check the request body has at least an endpoint.
  if (!req.body || !req.body.endpoint) {
    // Not a valid subscription.
    res.status(400);
    res.json({
      error: {
        id: 'no-endpoint',
        message: 'Subscription must have an endpoint.'
      }});
    return false;
  }
  return true;
};


const saveSubscriptionToDatabase = function(req) {
  return new Promise(function(resolve, reject) {
    var dbFile = path.join(req.app.locals.basedir, secrets.db);
    var db = new Datastore({filename: dbFile, autoload: true});
    db.insert(req.body, function(err, newDoc) {
      if (err) {
        reject(err);
        return;
      }
      resolve(newDoc._id);
    });
  });
};


/* Subscription API */
router.post('/save-subscription', function (req, res) {

  if (!isValidSaveRequest(req, res)) {
    return;
  }

  return saveSubscriptionToDatabase(req)
  .then(function(subscriptionId) {
    res.json({ data: { success: true, id: subscriptionId } });
  })
  .catch(function(err) {
    res.status(500);
    res.json({
      error: {
        id: 'unable-to-save-subscription',
        message: 'The subscription was received but we were unable to save it to our database.'
      }
    });
  });
});


module.exports = router;
