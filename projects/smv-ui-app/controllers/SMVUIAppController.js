'use strict';

const BASE_PATH = '';
const AUTH_TOKEN_KEY = 'X-AUTH-TOKEN';
const SMV_USERAUTH_BASE_URL = process.env['SMV_USERAUTH_BASE_URL'];

var request = require('request');

function extractAuthToken(req) {
  var token = req.headers[AUTH_TOKEN_KEY] || req.headers[AUTH_TOKEN_KEY.toLowerCase()];
  if (!token) {
    console.error(`${AUTH_TOKEN_KEY} is not in the header as key`);
  }
  return token;
}

function buildAuthHeaders(authtoken) {
  var authheaders = {};
  authheaders[AUTH_TOKEN_KEY] = authtoken;
  return authheaders;
}

function login(req, res, next) {
  // Login
  request.post({
    url: SMV_USERAUTH_BASE_URL+'/api/smv/v1/auth/login',
    form: req.body
  }, function(error, response, body) {
    if (error) {
      console.log(error);
      //return res.end(error);
      // Redirect to visiting list
      res.redirect(BASE_PATH + '/login?error='+error);
      return;
    }

    if (response.statusCode != 200) {
      console.error(`response code is ${response.statusCode}`);
      res.redirect(BASE_PATH + '/login?error='+response.body);
      return;
    }

    var authtoken = extractAuthToken(response);
    if (!authtoken) {
      res.redirect(BASE_PATH + '/login?error=authtoken is empty');
      return; 
    }
    res.cookie(AUTH_TOKEN_KEY, authtoken, {
      maxAge: 10000
    });
      
    // Redirect to visiting list
    res.redirect(BASE_PATH + '/visiting/list');
  });
}

function logout(req, res, next) {
  // Logout
  var authtoken = req.cookies[AUTH_TOKEN_KEY];
  if (!authtoken) {
    // Redirect to visiting list
    res.redirect(BASE_PATH + '/');
  }

  request.get({
    url: SMV_USERAUTH_BASE_URL+'/api/smv/v1/auth/logout',
    headers: buildAuthHeaders(authtoken)
  }, function(error, response, body) {
    console.log('logout done');

    // Remove Cookie
    res.clearCookie(AUTH_TOKEN_KEY);
    
    // Redirect to visiting list
    res.redirect(BASE_PATH + '/');
  });
}

module.exports = function(app, options) {
  app.post(BASE_PATH + '/api/login', login);
  app.get(BASE_PATH + '/api/logout', logout);

  // // Expose search option ahead of general document getting function
  // app.get(BASE_PATH + '/search', authenticatedFilter, searchBadgeInfos);
  // app.get(BASE_PATH + '/:id', authenticatedFilter, getBadgeInfo);
  // app.put(BASE_PATH + '/:id', authenticatedFilter, updateBadgeInfo);
  // app.delete(BASE_PATH + '/:id', authenticatedFilter, deleteBadgeInfo);
};