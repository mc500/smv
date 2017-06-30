'use strict';

const AUTH_TOKEN_KEY = 'X-AUTH-TOKEN';

var SMVAuthTokenHelper = require('./SMVAuthTokenHelper');

var USER_INFO_SAMPLES = [
  {
    'role' : 'ESCORT',
    'serial' : '1234567890',
    'phone' : '+82-2-1234-0000',
    'name' : 'John Doe',
    'mobile' : '+82-10-1234-0000',
    'userid' : 'CN=John Doe/OU=ACME/O=IBM',
    'email' : 'john.doe@acme.ibm.com',
    'dept': 'Client Innovation Lab',
    'passwd': 'passw0rd'
  },
  {
    'role' : 'RECEPTION',
    'serial' : '1000000000',
    'phone' : '+82-2-1234-1111',
    'name' : 'Jay Doe',
    'mobile' : '+82-10-1234-1111',
    'userid' : 'CN=Sally Doe/OU=ACME/O=IBM',
    'email' : 'sally.doe@acme.ibm.com',
    'dept': 'Client Service',
    'passwd': 'passw0rd'
  },
  {
    'role' : 'ADMIN',
    'serial' : '9000000000',
    'phone' : '+82-2-1234-9999',
    'name' : 'Lisa Doe',
    'mobile' : '+82-10-1234-9999',
    'userid' : 'CN=Lisa Doe/OU=ACME/O=IBM',
    'email' : 'lisa.doe@acme.ibm.com',
    'dept': 'Client Service',
    'passwd': 'passw0rd'
  }
];

function extractAuthToken(req) {
  var token = req.headers[AUTH_TOKEN_KEY] || req.headers[AUTH_TOKEN_KEY.toLowerCase()];
  if (!token) {
    console.error(`${AUTH_TOKEN_KEY} is not in the header as key`);
  }
  return token;
}

module.exports.userinfoGET = function (req, res, next) {
  /**
   * 로그인한 사용자의 정보를 조회
   *
   * returns inline_response_200
   **/
  var token = extractAuthToken(req);
  SMVAuthTokenHelper.isValidAuthToken(token, function(valid) {
    if (valid) {
      // 
      SMVAuthTokenHelper.getAuthTokenValue(token, 'userinfo', function(result){
        if (result) {
          res.setHeader('Content-Type', 'application/json');
          res.end(result);
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

  var sampleUserInfo;
  var email = args.email.value;
  var passwd = args.passwd.value;
  var isFound = USER_INFO_SAMPLES.some(function(userinfo) {
    if (userinfo.email == email) {
      sampleUserInfo = Object.assign({}, userinfo);
      return true;
    }
  });

  if (isFound && sampleUserInfo.passwd == passwd) {
    sampleUserInfo.passwd = undefined;
    sampleUserInfo = JSON.stringify(sampleUserInfo);
    SMVAuthTokenHelper.generateAuthToken(function(token) {
      // Set the key of user
      SMVAuthTokenHelper.setAuthTokenValue(token, 'userinfo', sampleUserInfo, function(result){
        if (result) {
          res.setHeader(AUTH_TOKEN_KEY, token);
          res.setHeader('Content-Type', 'application/json');
          res.end(sampleUserInfo);
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
