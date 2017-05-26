'use strict';

exports.authUserinfoGET = function(args, res, next) {
  /**
   * 로그인한 사용자의 정보를 조회
   *
   * returns inline_response_200
   **/
  var examples = {};
  examples['application/json'] = {
  "role" : "aeiou",
  "serial" : "1234567890",
  "phone" : "+82-2-1234-0000",
  "name" : "John Doe",
  "mobile" : "+82-10-1234-0000",
  "userid" : "CN=John Doe/OU=ACME/O=IBM",
  "email" : "john.doe@acme.ibm.com"
};
  if (Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  } else {
    res.end();
  }
}

exports.loginPOST = function(args, res, next) {
  /**
   * 주어진 인증 정보로 로그인
   *
   * email String 사용자 Email (optional)
   * passwd String 사용자 비밀번호 (optional)
   * no response value expected for this operation
   **/
  res.end();
}

exports.logoutGET = function(args, res, next) {
  /**
   * 로그인 상태에서 로그아웃
   *
   * no response value expected for this operation
   **/
  res.end();
}

