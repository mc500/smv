#!/usr/local/bin/node

/* eslint-env mocha */

var appEnv = require('cfenv').getAppEnv();

const AUTH_TOKEN_KEY = 'X-AUTH-TOKEN';
const BASE_PATH = appEnv.url+'/api/smv/v1/userinfo';
const TEST_TIMEOUT = 60*1000; // 60 seconds
const SMV_USERAUTH_BASE_URL = process.env['SMV_USERAUTH_BASE_URL'];
const SMV_USERINFO_TEST_USERID = 'CN=John Doe/OU=ACME/O=IBM';

var assert = require('assert'),
  request = require('request');

function extractAuthToken(res) {
  var token = res.headers[AUTH_TOKEN_KEY] || res.headers[AUTH_TOKEN_KEY.toLowerCase()];
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

describe('[SMVUserInfo API Test]', function() {
  var authtoken;

  this.timeout(TEST_TIMEOUT);

  before(function (done) {
    // Login
    request.post({
      url: SMV_USERAUTH_BASE_URL+'/api/smv/v1/auth/login',
      form: {
        email: 'john.doe@acme.ibm.com',
        passwd: 'passw0rd'
      }
    }, function(error, response, body) {
      authtoken = extractAuthToken(response);

      console.log(`login done and got the authtoken before: ${authtoken}`);
      assert(authtoken);
      done();
    });
  });

  after(function (done) {
    // Logout
    assert(authtoken);
    request.get({
      url: SMV_USERAUTH_BASE_URL+'/api/smv/v1/auth/logout',
      headers: buildAuthHeaders(authtoken)
    }, function(error, response, body) {
      authtoken = undefined;
      console.log('logout done');
      done();
    });
  });

  describe('General Test', function() {
    var testid = encodeURIComponent(SMV_USERINFO_TEST_USERID);
    describe('GET /{id}', function() {
      it('returns status code 401', function(done) {
        request.get(`${BASE_PATH}/${testid}`, function(error, response, body) {
          assert.equal(response.statusCode, 401);
          done();
        });
      });

      it('returns status code 200', function(done) {
        request.get({
          url: `${BASE_PATH}/${testid}`,
          headers: buildAuthHeaders(authtoken)
        }, function(error, response, body) {
          //console.log(body);
          assert.equal(response.statusCode, 200);
          done();
        });
      });
    });

    describe('PUT /{id}/role/{role}', function() {
      var role = 'RECEPTION';
      it('returns status code 401', function(done) {
        request.put(`${BASE_PATH}/${testid}/role/${role}`, function(error, response, body) {
          assert.equal(response.statusCode, 401);
          done();
        });
      });

      it('returns status code 200', function(done) {
        request.put({
          url: `${BASE_PATH}/${testid}/role/${role}`,
          headers: buildAuthHeaders(authtoken)
        }, function(error, response, body) {
          //console.log(body);
          assert.equal(response.statusCode, 200);
          //assert.notEqual(body.updated, undefined);
          done();
        });
      });

      it('returns status code 400', function(done) {
        role = 'UNKNOWN';
        request.put({
          url: `${BASE_PATH}/${testid}/role/${role}`,
          headers: buildAuthHeaders(authtoken)
        }, function(error, response, body) {
          //console.log(body);
          assert.equal(response.statusCode, 400);
          //assert.notEqual(body.updated, undefined);
          done();
        });
      });
    });
  });
});