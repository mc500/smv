'use strict';

var url = require('url'),
    SMVAuthTokenHelper = require('./SMVAuthTokenHelper');

function extractAuthToken(req) {
  var token = req.headers['x-auth-token'];
  return token;
}

module.exports.userinfoGET = function (req, res, next) {
  /**
   * 로그인한 사용자의 정보를 조회
   *
   * returns inline_response_200
   **/
  var example = {
    "role" : "USER",
    "serial" : "1234567890",
    "phone" : "+82-2-1234-0000",
    "name" : "John Doe",
    "mobile" : "+82-10-1234-0000",
    "userid" : "CN=John Doe/OU=ACME/O=IBM",
    "email" : "john.doe@acme.ibm.com"
  };

  var token = extractAuthToken(req);
  SMVAuthTokenHelper.isValidAuthToken(token, function(valid) {
    if (valid) {
      // 
      SMVAuthTokenHelper.getAuthTokenValue(token, 'userid', function(result){
        if (result && result == example.email) {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(example));
          res.end(); 
        } else {
          // Error 
          res.statusCode = 500;
          res.end('Internel Server Error');
        }
      });
    } else {
      res.statusCode = 401;
      res.end('Unauthorized');
    }
  });
};

module.exports.loginPOST = function (req, res, next) {
  // console.log(req.body.email);
  // console.log(req.body.passwd);
  // console.log(req.swagger.params.email.value);
  // console.log(req.swagger.params.passwd.value);
  /**
   * 주어진 인증 정보로 로그인
   *
   * email String 사용자 Email
   * passwd String 사용자 비밀번호
   * no response value expected for this operation
   **/
  var args = req.swagger.params;
  if (!args.email) {
    res.statusCode = 400;
    res.end('email is missing');
    return;
  }
  if (!args.passwd) {
    res.statusCode = 400;
    res.end('passwd is missing');
    return;
  }

  var email = args.email.value;
  var passwd = args.passwd.value
  if (email === 'john.doe@acme.ibm.com' && passwd === 'passw0rd') {
    SMVAuthTokenHelper.generateAuthToken(function(token) {
      // Set the key of user
      SMVAuthTokenHelper.setAuthTokenValue(token, 'userid', email, function(result){
        if (result) {
          res.setHeader('X-AUTH-TOKEN', token);
          res.end('OK'); 
        } else {
          // Error 
          res.statusCode = 500;
          res.end('Internel Server Error');
        }
      });
    });

    return;
  }
  
  res.statusCode = 401;
  res.end('Unauthorized');
};

module.exports.logoutGET = function (req, res, next) {
  //console.log(req.headers['x-auth-token']);
  /**
   * 로그인 상태에서 로그아웃
   *
   * no response value expected for this operation
   **/
  var token = extractAuthToken(req);
  SMVAuthTokenHelper.invalidateAuthToken(token, function(valid) {
      if (valid) {
      res.end('OK'); 
    } else {
      res.statusCode = 401;
      res.end('Unauthorized');      
    }
  });
};
