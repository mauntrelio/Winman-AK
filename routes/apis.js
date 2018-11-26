var createError = require('http-errors');
var Datastore = require('nedb');
var path = require('path');
var express = require('express');
var router = express.Router();

var utils = require('../lib/utils');
var secrets = require('../config/secrets.json');

var dbFile = path.join(__dirname, '..', secrets.db);
var db = new Datastore({filename: dbFile, autoload: true});

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

// save subscription data to the database
const saveSubscriptionToDatabase = function(req) {
  return new Promise(function(resolve, reject) {
    db.insert(req.body, function(err, newDoc) {
      if (err) {
        reject(err);
        return;
      }
      resolve(newDoc._id);
    });
  });
};

// save the visit of this subscription
const saveVisitToDatabase = function(req) {
  return new Promise(function(resolve, reject) {
    db.update({endpoint: req.body.endpoint}, {$addToSet: {days: req.body.day }}, function(err, doc) {
      if (err) {
        reject(err);
        return;
      }
      resolve(doc._id);
    }
    );
  });
};


/* Save Subscription API */
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


/* Save visit API */
router.post('/save-visit', function (req, res) {

  if (!isValidSaveRequest(req, res)) {
    return;
  }

  return saveVisitToDatabase(req)
  .then(function(subscriptionId) {
    res.json({ data: { success: true, id: subscriptionId } });
  })
  .catch(function(err) {
    res.status(500);
    res.json({
      error: {
        id: 'unable-to-save-visit',
        message: 'The visit was received but we were unable to save it to our database.'
      }
    });
  });
});



module.exports = router;
