#!/usr/local/bin/node

/* eslint-env mocha */

var appEnv = require('cfenv').getAppEnv();

const AUTH_TOKEN_KEY = 'X-AUTH-TOKEN';
const TEST_TIMEOUT = 60*1000; // 60 seconds
const TIMEZONE_NAME = 'Asia/Seoul';
const TEST_TIMEZONE_NAME = 'America/Chicago';
const TEST_DATE_FORMAT = 'YYYY-MM-DD';
const TEST_FORMAT = 'YYYY-MM-DDTHH:mm:ssZ(z)';


var assert = require('assert'),
  request = require('request'),
  moment = require('moment-timezone');

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

function printMomentDate(m, label) {
  label = label || 'date';

  console.log(` ${label} --> ${m.format(TEST_FORMAT)}`);
  console.log('     year: ' + m.year());
  console.log('    month: ' + m.month());
  console.log('     date: ' + m.date());
  console.log('    hours: ' + m.hours());
  console.log('  minutes: ' + m.minutes());
  console.log('  seconds: ' + m.seconds());
  console.log('   offset: ' + m.utcOffset());
}

describe('[SMVUI Test]', function() {
  var authtoken;

  this.timeout(TEST_TIMEOUT);
/*
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
*/
  describe.only('Timezone Test', function() {
    
    describe('moment format test', function() {
      it('timezone 적용', function(done) {
        var m = moment();
        console.log('before: ' + m.toDate() + ' --> ' + m.format(TEST_FORMAT));
        m.tz(TEST_TIMEZONE_NAME);
        console.log(' after: ' + m.toDate() + ' --> ' + m.format(TEST_FORMAT));
        done();
      });

      it('timezone으로 초기화', function(done) {
        var m = moment();
        var m2 = moment.tz(TEST_TIMEZONE_NAME);
        console.log('default: ' + m.toDate() + ' --> ' + m.format(TEST_FORMAT));
        console.log('   test: ' + m2.toDate() + ' --> ' + m2.format(TEST_FORMAT));
        done();
      });

      it('timezone 적용 후 항목 정보 보기', function(done) {
        var m = moment();
        printMomentDate(m, 'default');

        var m2 = moment.tz(TEST_TIMEZONE_NAME);
        printMomentDate(m2, 'test');
        done();
      });

      it('timezone 적용하여 값 변경하기', function(done) {
        var m = moment();
        m.hours(0);
        m.minutes(0);
        m.seconds(0);
        m.milliseconds(0);
        printMomentDate(m, 'default');

        var m2 = moment.tz(TEST_TIMEZONE_NAME);
        m2.hours(0);
        m2.minutes(0);
        m2.seconds(0);
        m2.milliseconds(0);
        printMomentDate(m2, 'test');
        done();
      });

      it('timezone 적용하여 값 변경하기', function(done) {

        var m = moment.tz('2017-07-03', TEST_TIMEZONE_NAME);
        printMomentDate(m, 'default');

        var m2 = moment.tz(new Date(), TEST_TIMEZONE_NAME);
        printMomentDate(m2, 'test');

        console.log(m2.format(TEST_DATE_FORMAT));

        var m3 = moment.tz(m2.format(TEST_DATE_FORMAT), TEST_TIMEZONE_NAME);
        printMomentDate(m3, 'test');

        console.log(m3.valueOf());
        done();
      });

      it('date millisecond 정보 확인 하기', function(done) {

        var m = moment.tz(TEST_TIMEZONE_NAME);
        console.log(m.valueOf());
        done();
      });

      it.only('date 정보 없이 초기화 하기', function(done) {

        var m = moment.tz(TEST_TIMEZONE_NAME);
        printMomentDate(m, 'default');

        var m2 = moment.tz(undefined, TEST_TIMEZONE_NAME);
        printMomentDate(m2, 'test');

        done();
      });
    });
  });
});