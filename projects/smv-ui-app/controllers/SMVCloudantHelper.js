'use strict';

const CLOUDANT_SERVICE_NAME = 'smv-ui-app-cloudantNoSQLDB';
const CLOUDANT_SMV_DATABASE = 'smv';

const appEnv = require('cfenv').getAppEnv();
var dbCredentials = appEnv.getServiceCreds(CLOUDANT_SERVICE_NAME);

// Initialize 
const cloudant = require('cloudant')(dbCredentials.url);

function createDatabase(dbName) {
  // check if DB exists if not create
  cloudant.db.create(dbName, function(err, res) {
    if (err) {
      console.log('Could not create new db: ' + dbName + ', it might already exist.');
    }
  });
}

// ----------------------------------------------------------------------------

module.exports = {
  'cloudant': cloudant,
  'initDB': function (dbName) {
    var name = dbName || CLOUDANT_SMV_DATABASE;

    // check if DB exists if not create
    createDatabase(name);

    return cloudant.use(name);
  }
};