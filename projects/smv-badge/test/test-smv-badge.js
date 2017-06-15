#!/usr/local/bin/node

/* eslint-env mocha */

var appEnv = require('cfenv').getAppEnv();

const AUTH_TOKEN_KEY = 'X-AUTH-TOKEN';
const BASE_PATH = appEnv.url+'/api/smv/v1/badge';
const TEST_TIMEOUT = 60*1000; // 60 seconds
const SMV_USERAUTH_BASE_URL = process.env['SMV_USERAUTH_BASE_URL'];
const SMV_BADGE_TEST_DOCID = '23481849182049';

const BADGE_SAMPLE = [{
  'type': 'VISITOR',
  'number': '01'
}, {
  'type': 'VISITOR',
  'number': '02'
}, {
  'type': 'VISITOR',
  'number': '03'
}];


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

describe('[SMVBadge API Test]', function() {
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

  describe('General CRUD Test', function() {
    var testid = SMV_BADGE_TEST_DOCID;

    describe('POST /', function() {
      it('returns status code 401', function(done) {
        request.post(BASE_PATH, function(error, response, body) {
          assert.equal(401, response.statusCode);
          done();
        });
      });

      it('returns status code 200', function(done) {
        assert(authtoken);

        var badgeObjectSample = BADGE_SAMPLE[0];

        request.post({
          url: BASE_PATH,
          headers: buildAuthHeaders(authtoken),
          json: badgeObjectSample
        }, function(error, response, body) {
          assert.equal(200, response.statusCode);

          testid = body.id;

          done();
        });
      });
    });

    console.log(`testid will be ${testid}`);

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
          //console.log(body);
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
          headers: buildAuthHeaders(authtoken),
          json: {
            number: 100
          }
        }, function(error, response, body) {
          // console.log(body);
          assert.equal(200, response.statusCode);
          assert.equal(body.number, 100);
          //assert.notEqual(body.updated, undefined);
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
  });

  describe.only('GET /search', function() {
    it('returns status code 401', function(done) {
      request.get(`${BASE_PATH}/search`, function(error, response, body) {
        assert.equal(401, response.statusCode);
        done();
      });
    });

    // Create Test Data
    before(function(done) {
      assert(authtoken);
      var counter = 0;
      for(var idx=0; idx<3;idx++) {
        var badgeObjectSample = Object.assign(BADGE_SAMPLE[idx], {
          'id': `searchtest${idx}`
        });

        //console.log(badgeObjectSample);

        request.post({
          url: BASE_PATH,
          headers: buildAuthHeaders(authtoken),
          json: badgeObjectSample
        }, function(error, response, body) {
          assert.equal(200, response.statusCode);
          if (++counter == 3) {
            done();
          }
        });
      }
    });

    // Remove Test Data
    after(function(done) {
      assert(authtoken);
      var counter = 0;
      for(var idx=0; idx<3;idx++) {
        request.delete({
          url: `${BASE_PATH}/searchtest${idx}`,
          headers: buildAuthHeaders(authtoken)
        }, function(error, response, body) {
          assert.equal(200, response.statusCode);
          if (++counter == 3) {
            done();
          }
        });
      }
    });

    it('query unknown type', function(done) {
      request.get({
        url: `${BASE_PATH}/search`,
        headers: buildAuthHeaders(authtoken),
        qs: {
          type: 'TYPE',
          keyword: 'janess'
        }
      }, function(error, response, body) {
        assert.equal(200, response.statusCode);
        var json = JSON.parse(body);
        assert.equal(json.result.length, 0);
        done();
      });
    });

    it('query by TYPE', function(done) {
      request.get({
        url: `${BASE_PATH}/search`,
        headers: buildAuthHeaders(authtoken),
        qs: {
          type: 'TYPE',
          keyword: BADGE_SAMPLE[0].type
        }
      }, function(error, response, body) {
        assert.equal(200, response.statusCode);
        var json = JSON.parse(body);
        //console.log(json);
        assert.equal(json.result.length, 3);
        assert.equal(BADGE_SAMPLE[0].type, json.result[0].type);
        done();
      });
    });

    it('query by NUMBER', function(done) {
      request.get({
        url: `${BASE_PATH}/search`,
        headers: buildAuthHeaders(authtoken),
        qs: {
          type: 'NUMBER',
          keyword: BADGE_SAMPLE[1].number
        }
      }, function(error, response, body) {
        assert.equal(200, response.statusCode);
        var json = JSON.parse(body);
        //console.log(json);
        assert.equal(json.result.length, 1);
        assert.equal(BADGE_SAMPLE[1].number, json.result[0].number);
        done();
      });
    });

    it('page size 0', function(done) {
      request.get({
        url: `${BASE_PATH}/search`,
        headers: buildAuthHeaders(authtoken),
        qs: {
          //size: 1,
          //page: 0
        }
      }, function(error, response, body) {
        assert.equal(200, response.statusCode);
        var json = JSON.parse(body);
        assert.notEqual(json.result.length, 0);
        done();
      });
    });

    it('page size 1', function(done) {
      request.get({
        url: `${BASE_PATH}/search`,
        headers: buildAuthHeaders(authtoken),
        qs: {
          size: 1,
          //page: 0
        }
      }, function(error, response, body) {
        assert.equal(200, response.statusCode);
        var json = JSON.parse(body);
        assert.equal(json.result.length, 1);
        // console.log(json);
        assert.equal(BADGE_SAMPLE[0].number, json.result[0].number);
        done();
      });
    });

    it('page size 1, page idx2', function(done) {
      request.get({
        url: `${BASE_PATH}/search`,
        headers: buildAuthHeaders(authtoken),
        qs: {
          size: 1,
          page: 2
        }
      }, function(error, response, body) {
        assert.equal(200, response.statusCode);
        var json = JSON.parse(body);
        assert.equal(json.result.length, 1);
        assert.equal(BADGE_SAMPLE[2].number, json.result[0].number);
        done();
      });
    });

    it('page size 1, out of page idx', function(done) {
      request.get({
        url: `${BASE_PATH}/search`,
        headers: buildAuthHeaders(authtoken),
        qs: {
          size: 1,
          page: 10
        }
      }, function(error, response, body) {
        assert.equal(200, response.statusCode);
        var json = JSON.parse(body);
        assert.equal(json.result.length, 1);
        done();
      });
    });

    it('invliad page size', function(done) {
      request.get({
        url: `${BASE_PATH}/search`,
        headers: buildAuthHeaders(authtoken),
        qs: {
          size: 0,
          page: 10
        }
      }, function(error, response, body) {
        assert.equal(400, response.statusCode);
        done();
      });
    });

    it('invliad page index', function(done) {
      request.get({
        url: `${BASE_PATH}/search`,
        headers: buildAuthHeaders(authtoken),
        qs: {
          size: 1,
          page: -1
        }
      }, function(error, response, body) {
        assert.equal(400, response.statusCode);
        done();
      });
    });
  });
});