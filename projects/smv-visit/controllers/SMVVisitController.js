'use strict';

const BASE_PATH = '/api/smv/v1/visit';
const AUTH_TOKEN_KEY = 'X-AUTH-TOKEN';

var SMVAuthTokenHelper = require('./SMVAuthTokenHelper'),
  SMVCloudantHelper = require('./SMVCloudantHelper');

function extractAuthToken(req) {
  var token = req.headers[AUTH_TOKEN_KEY] || req.headers[AUTH_TOKEN_KEY.toLowerCase()];
  if (!token) {
    console.error(`${AUTH_TOKEN_KEY} is not in the header as key`);
  }
  return token;
}

function authenticatedFilter(req, res, next) {
  var token = extractAuthToken(req);
  SMVAuthTokenHelper.isValidAuthToken(token, function(valid) {
    //valid = true;
    if (valid) {
      // go next
      return next();
    }

    res.statusCode = 401;
    res.end('Unauthorized');
  });
}


var visitorSample = {
  'name': 'Jane Doe',
  'title': 'Dr.',
  'contact': '+82-1-1234-0678',
  'email': 'jane.doe@customer.com',
  'nationality': 'South Korea',
  'company': 'Customers Inc'
};

var escortSample = {
  'id': 'CN=John Doe/OU=ACME/O=IBM',
  'name': 'John Doe',
  'email': 'john.doe@acme.ibm.com',
  'dept': 'Client Innovation Lab'
};

var agreementSample = {
  'templateid': '238a8a7d77f7bf',
  'agreement': 'User agreement blabla',
  'date': 1493349000000,
  'signature': 'data:image/jpeg;base64,R0lGODlhDwAOAOYAAAAAAP'
};

var badgeSample = {
  'id': 12392391239,
  'type': 'VISITOR',
  'number': 1,
  'returnYN': 'YES'
};

var visitObjectSample = {
  'id': 10103023023010,
  'date': '2017-04-28 12:10:00 GMT+09:00',
  'updated': 1493349000000,
  'visitor': visitorSample,
  'escort': escortSample,
  'agreement': agreementSample,
  'badge': badgeSample
};


function newVisit(req, res) {
  console.log(req.body);

  // TODO
  res.statusCode = 200;
  res.end('OK');
}

function getVisit(req, res) {
  var id = req.params.id;

  console.log(`getVisit: visit id ${id}`);
  
  // TODO
  res.json(visitObjectSample);
  res.end();
}

function updateVisit(req, res) {
  var id = req.params.id;
  
  console.log(`visit id ${id}`);

  // TODO
  res.statusCode = 200;
  res.end('OK');
}

function deleteVisit(req, res) {
  var id = req.params.id;
  
  console.log(`visit id ${id}`);

  // TODO
  res.statusCode = 200;
  res.end('OK');
}

function searchVisits(req, res) {
  // TODO
  res.statusCode = 200;
  res.end('OK');
}

module.exports = function(app, options) {
  app.post(BASE_PATH, authenticatedFilter, newVisit);
  app.get(BASE_PATH + '/:id', authenticatedFilter, getVisit);
  app.put(BASE_PATH + '/:id', authenticatedFilter, updateVisit);
  app.delete(BASE_PATH + '/:id', authenticatedFilter, deleteVisit);

  app.get(BASE_PATH + '/search', authenticatedFilter, searchVisits);
};