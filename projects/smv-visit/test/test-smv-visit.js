#!/usr/local/bin/node

/* eslint-env mocha */

var appEnv = require('cfenv').getAppEnv();

const AUTH_TOKEN_KEY = 'X-AUTH-TOKEN';
const BASE_PATH = appEnv.url+'/api/smv/v1/visit';
const TEST_TIMEOUT = 60*1000; // 60 seconds
const SMV_USERAUTH_BASE_URL = process.env['SMV_USERAUTH_BASE_URL'];
const SMV_VISIT_TEST_DOCID = '10103023023010';

const VISITOR_SAMPLE = [{
  'name': 'Jane Doe',
  'title': 'Dr.',
  'contact': '+82-1-1234-0678',
  'email': 'jane.doe@customer.com',
  'nationality': 'South Korea',
  'company': 'Customers Inc'
}, {
  'name': 'Kay Doe',
  'title': 'Dr.',
  'contact': '+82-1-1234-1111',
  'email': 'kay.doe@customer.com',
  'nationality': 'South Korea',
  'company': 'Customers Inc'
}, {
  'name': 'Jimmy Doe',
  'title': 'Dr.',
  'contact': '+82-1-1234-2222',
  'email': 'jimmy.doe@customer.com',
  'nationality': 'South Korea',
  'company': 'Customers Inc'
}];

const ESCORT_SAMPLE = [{
  'id': 'CN=John Doe/OU=ACME/O=IBM',
  'name': 'John Doe',
  'email': 'john.doe@acme.ibm.com',
  'dept': 'Client Innovation Lab'
}, {
  'id': 'CN=John Doe/OU=ACME/O=IBM',
  'name': 'John Doe',
  'email': 'john.doe@acme.ibm.com',
  'dept': 'Client Innovation Lab'
}, {
  'id': 'CN=John Doe/OU=ACME/O=IBM',
  'name': 'John Doe',
  'email': 'john.doe@acme.ibm.com',
  'dept': 'Client Innovation Lab'
}];

const AGREEMENT_SAMPLE = [{
  'templateid': '238a8a7d77f7bf',
  'agreement': 'User agreement blabla',
  'date': 1493349000000, // Fri Apr 28 2017 12:10:00 GMT+0900 (KST) , 2017-04-28T03:10:00.000Z 
  'signature': 'data:image/jpeg;base64,R0lGODlhDwAOAOYAAAAAAP'
}, {
  'templateid': '238a8a7d77f7bf',
  'agreement': 'User agreement blabla',
  'date': 1493349060000, // Fri Apr 28 2017 12:11:00 GMT+0900 (KST) , 2017-04-28T03:11:00.000Z 
  'signature': 'data:image/jpeg;base64,R0lGODlhDwAOAOYAAAAAAP'
}, {
  'templateid': '238a8a7d77f7bf',
  'agreement': 'User agreement blabla',
  'date': 1493521920000, // Fri Apr 30 2017 12:12:00 GMT+0900 (KST) , 2017-04-30T03:12:00.000Z 
  'signature': 'data:image/jpeg;base64,R0lGODlhDwAOAOYAAAAAAP'
}];

const BADGE_SAMPLE = [{
  'id': '12392391231',
  'type': 'VISITOR',
  'number': 1,
  'returnYN': 'YES'
}, {
  'id': '12392391232',
  'type': 'VISITOR',
  'number': 2,
  'returnYN': 'YES'
}, {
  'id': '12392391233',
  'type': 'VISITOR',
  'number': 3,
  'returnYN': 'YES'
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

describe('[SMVVisit API Test]', function() {
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

  describe.only('General CRUD Test', function() {
    var testid = SMV_VISIT_TEST_DOCID;

    describe('POST /', function() {
      it('returns status code 401', function(done) {
        request.post(BASE_PATH, function(error, response, body) {
          assert.equal(401, response.statusCode);
          done();
        });
      });

      it('returns status code 200', function(done) {
        assert(authtoken);

        var visitObjectSample = {
          //'id': '10103023023010',
          'date': new Date(AGREEMENT_SAMPLE[0].date).toString(),
          //'updated': 1493349000000,
          'visitor': VISITOR_SAMPLE[0],
          'escort': ESCORT_SAMPLE[0],
          'agreement': AGREEMENT_SAMPLE[0],
          'badge': BADGE_SAMPLE[0]
        };

        request.post({
          url: BASE_PATH,
          headers: buildAuthHeaders(authtoken),
          json: visitObjectSample
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
            visitor: {
              name: 'Kay'
            }
          }
        }, function(error, response, body) {
          //console.log(body);
          assert.equal(200, response.statusCode);
          assert.equal(body.visitor.name, 'Kay');
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

  describe('GET /search', function() {
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
        var visitObjectSample = {
          'id': `searchtest${idx}`,
          'date': new Date(AGREEMENT_SAMPLE[idx].date).toString(),
          //'updated': 1493349000000,
          'visitor': VISITOR_SAMPLE[idx],
          'escort': ESCORT_SAMPLE[idx],
          'agreement': AGREEMENT_SAMPLE[idx],
          'badge': BADGE_SAMPLE[idx]
        };

        request.post({
          url: BASE_PATH,
          headers: buildAuthHeaders(authtoken),
          json: visitObjectSample
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

    it('query unknown name', function(done) {
      request.get({
        url: `${BASE_PATH}/search`,
        headers: buildAuthHeaders(authtoken),
        qs: {
          type: 'NAME',
          keyword: 'janess'
        }
      }, function(error, response, body) {
        assert.equal(200, response.statusCode);
        var json = JSON.parse(body);
        assert.equal(json.result.length, 0);
        done();
      });
    });

    it('query by NAME', function(done) {
      request.get({
        url: `${BASE_PATH}/search`,
        headers: buildAuthHeaders(authtoken),
        qs: {
          type: 'NAME',
          keyword: VISITOR_SAMPLE[0].name
        }
      }, function(error, response, body) {
        assert.equal(200, response.statusCode);
        var json = JSON.parse(body);
        assert.equal(json.result.length, 1);
        assert.equal(VISITOR_SAMPLE[0].name, json.result[0].visitor.name);
        done();
      });
    });

    it('query by EMAIL', function(done) {
      request.get({
        url: `${BASE_PATH}/search`,
        headers: buildAuthHeaders(authtoken),
        qs: {
          type: 'EMAIL',
          keyword: VISITOR_SAMPLE[1].email
        }
      }, function(error, response, body) {
        assert.equal(200, response.statusCode);
        var json = JSON.parse(body);
        assert.equal(json.result.length, 1);
        assert.equal(VISITOR_SAMPLE[1].email, json.result[0].visitor.email);
        done();
      });
    });

    it('query by CONTACT', function(done) {
      request.get({
        url: `${BASE_PATH}/search`,
        headers: buildAuthHeaders(authtoken),
        qs: {
          type: 'CONTACT',
          keyword: VISITOR_SAMPLE[2].contact
        }
      }, function(error, response, body) {
        assert.equal(200, response.statusCode);
        var json = JSON.parse(body);
        assert.equal(json.result.length, 1);
        assert.equal(VISITOR_SAMPLE[2].contact, json.result[0].visitor.contact);
        done();
      });
    });

    it('query by DATE1', function(done) {
      request.get({
        url: `${BASE_PATH}/search`,
        headers: buildAuthHeaders(authtoken),
        qs: {
          date: new Date(AGREEMENT_SAMPLE[0].date)
        }
      }, function(error, response, body) {
        assert.equal(200, response.statusCode);
        var json = JSON.parse(body);
        assert.equal(json.result.length, 2);
        assert.equal(new Date(AGREEMENT_SAMPLE[0].date).toDateString(), new Date(json.result[0].date).toDateString());
        done();
      });
    });

    it('query by DATE2', function(done) {
      request.get({
        url: `${BASE_PATH}/search`,
        headers: buildAuthHeaders(authtoken),
        qs: {
          date: new Date(AGREEMENT_SAMPLE[2].date)
        }
      }, function(error, response, body) {
        assert.equal(200, response.statusCode);
        var json = JSON.parse(body);
        assert.equal(json.result.length, 1);
        assert.equal(new Date(AGREEMENT_SAMPLE[2].date).toDateString(), new Date(json.result[0].date).toDateString());
        done();
      });
    });

    it('query by NAME, DATE1', function(done) {
      request.get({
        url: `${BASE_PATH}/search`,
        headers: buildAuthHeaders(authtoken),
        qs: {
          date: new Date(AGREEMENT_SAMPLE[2].date),
          type: 'NAME',
          keyword: VISITOR_SAMPLE[0].name
        }
      }, function(error, response, body) {
        assert.equal(200, response.statusCode);
        var json = JSON.parse(body);
        assert.equal(json.result.length, 0);
        done();
      });
    });

    it('query by NAME, DATE2', function(done) {
      request.get({
        url: `${BASE_PATH}/search`,
        headers: buildAuthHeaders(authtoken),
        qs: {
          date: new Date(AGREEMENT_SAMPLE[1].date),
          type: 'NAME',
          keyword: VISITOR_SAMPLE[0].name
        }
      }, function(error, response, body) {
        assert.equal(200, response.statusCode);
        var json = JSON.parse(body);
        assert.equal(json.result.length, 1);
        assert.equal(new Date(VISITOR_SAMPLE[0].email).toDateString(), new Date(json.result[0].visitor.email).toDateString());
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
        assert.equal(new Date(VISITOR_SAMPLE[0].email).toDateString(), new Date(json.result[0].visitor.email).toDateString());
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
        assert.equal(new Date(VISITOR_SAMPLE[2].email).toDateString(), new Date(json.result[0].visitor.email).toDateString());
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