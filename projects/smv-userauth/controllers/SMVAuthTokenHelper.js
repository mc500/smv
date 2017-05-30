'use strict';

const REDIS_SERVICE_NAME = 'Compose for Redis-smv';
// const REDIS_SERVICE_NAME = 'Redis Cloud-smv';
const EXPIRES_AFTER_SECS = 3600; // an hour

const appEnv = require('cfenv').getAppEnv();
const redis = require("redis");
const uuidV4 = require('uuid/v4');

const redisCredentials = appEnv.getServiceCreds(REDIS_SERVICE_NAME);

// Initialize 
var redisClientOptions;

if (redisCredentials.uri) {
  redisClientOptions = {
    'url': redisCredentials.uri
  };
} else {
  redisClientOptions = {
    'host': redisCredentials.hostname,
    'port': redisCredentials.port,
    'password': redisCredentials.password
  };
}

const redisClient = redis.createClient(redisClientOptions);

redisClient.on('error', function (err) {
  console.error('error event - ' + redisClient.host + ':' + redisClient.port + ' - ' + err);
});

// ----------------------------------------------------------------------------

function tokenAsKey(token) {
  return token.replace(/-/gi, '_'); // replace all of '-' to '_'
}
function tokenAsHashKey(token) {
  return tokenAsKey(token).concat('_hash');
}

// ----------------------------------------------------------------------------

function generateAuthToken(resultcb) {
  // step1. Create Random Key
  var token = uuidV4();

  // step2. Set Key
  var key = tokenAsKey(token);
  redisClient.set(key, 'ttl', function(error, result) {
    
    if (error) {
      console.error('error: '+error);
      resultcb();  // empty
    } else {
      // step3. Set Expire
      redisClient.expire(key, EXPIRES_AFTER_SECS, function(error, result) {
        
          console.log(result);
        if (error) {
          console.error(error);
          resultcb();  // empty
        } else {
          resultcb(token); 
        }
      });
    }
  });
}

function invalidateAuthToken(token, resultcb) {
  var key = tokenAsKey(token);

  redisClient.del(key, function(error, result) {
    if (error) {
      console.error('error: '+error);
      resultcb();  // empty
    } else {
      resultcb(result);
    }
  });
}

function isValidAuthToken(token, resultcb) {
  var key = tokenAsKey(token);

  redisClient.ttl(key, function(error, result) {
    if (error) {
      console.error('error: '+error);
      resultcb();  // empty
    } else {
      resultcb(result > 0);  // returns true or false
    }
  });
}

function getAuthTokenValue(token, field, resultcb) {
  var key = tokenAsHashKey(token);

  redisClient.hget(key, field, function(error, result) {
    if (error) {
      console.error('error: '+error);
      resultcb();  // empty
    } else {
      resultcb(result); 
    }
  });
}

function setAuthTokenValue(token, field, value, resultcb) {
  var key = tokenAsHashKey(token);

  redisClient.hset(key, field, value, function(error, result) {
    if (error) {
      console.error('error: '+error);
      resultcb();  // empty
    } else {
      resultcb(result); 
    }
  });
}

// ----------------------------------------------------------------------------

module.exports = {
  generateAuthToken: generateAuthToken,
  isValidAuthToken: isValidAuthToken,
  invalidateAuthToken: invalidateAuthToken,
  setAuthTokenValue: setAuthTokenValue,
  getAuthTokenValue: getAuthTokenValue,
};