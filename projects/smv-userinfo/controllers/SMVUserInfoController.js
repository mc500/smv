'use strict';

const BASE_PATH = '/api/smv/v1/userinfo';
const AUTH_TOKEN_KEY = 'X-AUTH-TOKEN';

var SMVAuthTokenHelper = require('./SMVAuthTokenHelper');

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

var USER_INFO_SAMPLE = [{
  'userid': 'CN=John Doe/OU=ACME/O=IBM',
  'serial': '1234567890', 
  'name': 'John Doe',
  'email': 'john.doe@acme.ibm.com',
  'dept': 'Client Innovation Lab',
  'phone': '+82-2-1234-0001',
  'mobile': '+82-10-1234-0001',
  'role': 'ESCORT'
}, {
  'userid': 'CN=Sally Doe/OU=ACME/O=IBM',
  'name': 'Sally Doe',
  'email': 'sally.doe@acme.ibm.com',
  'dept': 'Client Innovation Lab',
  'phone': '+82-2-1234-1002',
  'mobile': '+82-10-1234-1002',
  'role': 'RECEPTION'
}, {
  'userid': 'CN=Lisa Doe/OU=ACME/O=IBM',
  'name': 'Lisa Doe',
  'email': 'lisa.doe@acme.ibm.com',
  'dept': 'Client Innovation Lab',
  'phone': '+82-2-1234-9003',
  'mobile': '+82-10-1234-9003',
  'role': 'ADMIN'
}];

var USER_ROLES = ['ESCORT', 'RECEPTION', 'ADMIN'];

function getUserInfo(req, res) {
  var userid = req.params.id;

  console.log(`getUserInfo: user id ${userid}`);

  var isFound = USER_INFO_SAMPLE.some(function(userinfo) {
    if (userinfo.userid == userid) {
      res.json(userinfo);
      res.end();
      return true;
    }
  });

  if (isFound) return;

  // Not Found
  console.error('User Not Found');

  // Error 
  res.statusCode = 404;
  res.end('User Not Found');
}

function updateUserRole(req, res) {
  var userid = req.params.id;
  var newrole = req.params.role;
  
  console.log(`updateUserRole: user id ${userid}, ${newrole}`);

  if (!userid) {
    console.error('User\'s id is empty');
    // Error 
    res.statusCode = 400;
    res.end('Invalid Argument');
  }

  // Find roles
  if (USER_ROLES.indexOf(newrole) < 0) {
    // Not Found
    console.error(`Unknown role code : ${newrole}`);
    // Error 
    res.statusCode = 400;
    res.end('Invalid Argument');
  }

  // Find user info
  var foundUserInfo = undefined;
  USER_INFO_SAMPLE.some(function(userinfo) {
    if (userinfo.userid == userid) {
      foundUserInfo = Object.assign({}, userinfo);
      foundUserInfo.role = newrole;
      return true;
    }
  });

  if (foundUserInfo) {
    res.json(foundUserInfo);
    res.end();
    return ;
  }

  // Not Found
  console.error('User Not Found');

  // Error 
  res.statusCode = 404;
  res.end('User Not Found');
}

module.exports = function(app, options) {

  // Expose search option ahead of general document getting function
  app.get(BASE_PATH + '/:id', authenticatedFilter, getUserInfo);
  app.put(BASE_PATH + '/:id/role/:role', authenticatedFilter, updateUserRole);
};