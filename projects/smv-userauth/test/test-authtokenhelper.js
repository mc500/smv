#!/usr/local/bin/node

const TEST_TIMEOUT = 60*1000; // 60 seconds

var assert = require('assert'),
    SMVAuthTokenHelper = require('../controllers/SMVAuthTokenHelper');

describe('[SMVAuthTokenHelper Unit Test]', function() {

    var authtoken;

    before(function () {
        //console.log('>>>>>>>>>>>>>>> before');
    });

    after(function () {
        //console.log('after <<<<<<<<<<<<<<<<');
    });

    this.timeout(TEST_TIMEOUT);

    it('AuthToken generation', function (done) {
        SMVAuthTokenHelper.generateAuthToken(function(token) {
            assert(token);

            // keep this. it will be used later testcases
            authtoken = token;

            done();
        });
    });

    it('AuthToken validation', function (done) {
        assert(authtoken);
        SMVAuthTokenHelper.isValidAuthToken(authtoken, function(valid) {
            assert(valid);

            done();
        });
    });

    it('AuthToken validation negative test', function (done) {
        SMVAuthTokenHelper.isValidAuthToken('mykey', function(valid) {
            assert(!valid);

            done();
        });
    });

    it('AuthToken set value', function (done) {
        assert(authtoken);
        SMVAuthTokenHelper.setAuthTokenValue(authtoken, 'myfield', 'myvalue', function(result) {
            assert(result);

            done();
        });
    });

    it('AuthToken get value', function (done) {
        assert(authtoken);
        SMVAuthTokenHelper.getAuthTokenValue(authtoken, 'myfield', function(result) {
            assert(result == 'myvalue');

            done();
        });
    });

    it('AuthToken invalidate', function (done) {
        assert(authtoken);
        SMVAuthTokenHelper.invalidateAuthToken(authtoken, function(valid) {
            assert(valid);

            SMVAuthTokenHelper.isValidAuthToken(authtoken, function(valid) {
                authtoken = undefined;
                assert(!valid);

                done();
            });
        });
    });
});