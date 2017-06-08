#!/usr/local/bin/node

/* eslint-env mocha */

var appEnv = require('cfenv').getAppEnv();

const AUTH_TOKEN_KEY = 'X-AUTH-TOKEN';
const BASE_PATH = appEnv.url+'/api/smv/v1/visit';
const TEST_TIMEOUT = 60*1000; // 60 seconds
const SMV_USERAUTH_BASE_URL = process.env['SMV_USERAUTH_BASE_URL'];

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

describe('[SMVVisit API Test]', function() {
  var authtoken,
    testid;

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

  describe.only('POST /', function() {
    it('returns status code 401', function(done) {
      request.post(BASE_PATH, function(error, response, body) {
        assert.equal(401, response.statusCode);
        done();
      });
    });

    it('returns status code 200', function(done) {
      assert(authtoken);
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

      request.post({
        url: BASE_PATH,
        headers: buildAuthHeaders(authtoken),
        json: visitObjectSample
      }, function(error, response, body) {
        assert.equal(200, response.statusCode);
        done();
      });
    });
  });

  describe('GET /{id}', function() {
    it('returns status code 401', function(done) {
      request.get(`${BASE_PATH}/${testid}`, function(error, response, body) {
        assert.equal(401, response.statusCode);
        done();
      });
    });

    it('returns status code 200', function(done) {
      request.get({
        url: `${BASE_PATH}/${testid}`,
        headers: buildAuthHeaders(authtoken)
      }, function(error, response, body) {
        assert.equal(200, response.statusCode);
        done();
      });
    });
  });

  describe('PUT /{id}', function() {
    it('returns status code 401', function(done) {
      request.put(`${BASE_PATH}/${testid}`, function(error, response, body) {
        assert.equal(401, response.statusCode);
        done();
      });
    });

    it('returns status code 200', function(done) {
      request.put({
        url: `${BASE_PATH}/${testid}`,
        headers: buildAuthHeaders(authtoken)
      }, function(error, response, body) {
        assert.equal(200, response.statusCode);
        done();
      });
    });
  });

  describe('DELETE /{id}', function() {
    it('returns status code 401', function(done) {
      request.delete(`${BASE_PATH}/${testid}`, function(error, response, body) {
        assert.equal(401, response.statusCode);
        done();
      });
    });

    it('returns status code 200', function(done) {
      request.delete({
        url: `${BASE_PATH}/${testid}`,
        headers: buildAuthHeaders(authtoken)
      }, function(error, response, body) {
        assert.equal(200, response.statusCode);
        done();
      });
    });
  });

  describe('GET /search', function() {
    it('returns status code 401', function(done) {
      request.get(`${BASE_PATH}/search`, function(error, response, body) {
        assert.equal(401, response.statusCode);
        done();
      });
    });

    it('returns status code 200', function(done) {
      request.get({
        url: `${BASE_PATH}/search`,
        headers: buildAuthHeaders(authtoken)
      }, function(error, response, body) {
        assert.equal(200, response.statusCode);
        done();
      });
    });
  });
});