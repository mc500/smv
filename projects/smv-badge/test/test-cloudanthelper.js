#!/usr/local/bin/node

/* eslint-env mocha */

const TEST_TIMEOUT = 60*1000; // 60 seconds

var assert = require('assert'),
  SMVCloudantHelper = require('../controllers/SMVCloudantHelper');

describe('[SMVCloudantHelper Unit Test]', function() {
  before(function () {
    //console.log('>>>>>>>>>>>>>>> before');
  });

  after(function () {
    //console.log('after <<<<<<<<<<<<<<<<');
  });

  this.timeout(TEST_TIMEOUT);

  describe('smv database test', function() {
    var mydb = SMVCloudantHelper.initDB('smv'),
      docid = 'test',
      doctype = 'test',
      jsondoc,
      lastrev;

    const json = {
      _id: docid,
      type: doctype,
      text: 'hello'
    };

    it('CREATE', function (done) {
      assert(mydb);
      mydb.insert(json, function(err, doc) {
        if (err) {
          done(err);
        } else {
          assert(doc.id == docid);
          done();
        }
      });
    });

    it('READ', function (done) {
      assert(mydb);
      mydb.get(docid, function(err, doc) {
        if (err) {
          done(err);
        } else {
          jsondoc = Object.assign({}, doc);
          lastrev = doc._rev;
          assert(doc._id == docid);
          assert(doc.type == doctype);
          done();
        }
      });
    });

    it('UPDATE', function (done) {
      assert(mydb);
      assert(jsondoc);
      jsondoc.text = 'world';
      mydb.insert(jsondoc, function(err, doc) {
        if (err) {
          done(err);
        } else {
          lastrev = doc.rev;
          assert(lastrev);
          assert(doc.id == docid);
          done();
        }
      });
    });

    it('DELETE', function (done) {
      assert(mydb);
      assert(docid);
      assert(lastrev);
      mydb.destroy(docid, lastrev, function(err, doc) {
        if (err) {
          done(err);
        } else {
          assert(doc.id == docid);
          done();
        }
      });
    });
  });
});