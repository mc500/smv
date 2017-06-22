'use strict';

const BASE_PATH = '';
const AUTH_TOKEN_KEY = 'X-AUTH-TOKEN';

var SMVAuthTokenHelper = require('../controllers/SMVAuthTokenHelper'),
  SMVCloudantHelper = require('../controllers/SMVCloudantHelper'),
  mydb = SMVCloudantHelper.initDB('smv');

function extractAuthToken(req) {
  //var token = req.headers[AUTH_TOKEN_KEY] || req.headers[AUTH_TOKEN_KEY.toLowerCase()];
  var token = req.cookies[AUTH_TOKEN_KEY];
  if (!token) {
    console.error(`${AUTH_TOKEN_KEY} is not in cookies`);
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

	// redirect to login
    res.redirect(BASE_PATH + '/login');
  });
}

function login(req, res) {
  res.render('login.html', {});
}

function register(req, res) {
  res.render('visiting/register.html', {});
}

function detail(req, res) {
  console.log(`visiting detail`);

  res.render('visiting/detail.html', {});
}

function visitinglist(req, res) {
  console.log(`visiting list`);

  res.render('visiting/list.html', {});
}

function confirm(req, res) {
  console.log(`visiting confirm`);

  res.render('visiting/confirm.html', {});
}

function agreement(req, res) {
  console.log(`agreement`);

  res.render('visiting/agreement.html', {});
}

function badgelist(req, res) {
  res.render('badge/list.html', {});
}

exports.init = function(app) {
  app.get('/', authenticatedFilter, function(req, res) {
  	// redirect to visiting list
  	res.redirect(BASE_PATH + '/visiting/list');
  });
  app.get(BASE_PATH + '/login', login);
  app.get(BASE_PATH + '/visiting/register', authenticatedFilter, register);
  app.get(BASE_PATH + '/visiting/list', authenticatedFilter, visitinglist);
  app.get(BASE_PATH + '/visiting/detail', authenticatedFilter, detail);
  app.get(BASE_PATH + '/visiting/confirm', authenticatedFilter, confirm);
  app.get(BASE_PATH + '/visiting/agreement', authenticatedFilter, agreement);
  app.get(BASE_PATH + '/badge/list', authenticatedFilter, badgelist);
};