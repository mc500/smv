'use strict';

const REDIS_SERVICE_NAME = 'Compose for Redis-smv';
// const REDIS_SERVICE_NAME = 'Redis Cloud-smv';
const EXPIRES_IN_SECS = 3600; // an hour

const appEnv = require('cfenv').getAppEnv();
const redis = require('redis');
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

redisClient.on('error', (err) => {
  console.error('error event - ' + redisClient.host + ':' + redisClient.port + ' - ' + err);
});

// ----------------------------------------------------------------------------

function tokenAsKey(token) {
  return token ? token.replace(/-/gi, '_') : undefined; // replace all of '-' to '_'
}

// ----------------------------------------------------------------------------

function generateAuthToken(resultcb) {
  // step1. Create Random Key
  var token = uuidV4();

  // step2. Use the key with hash
  var key = tokenAsKey(token);
  redisClient.hset(key, '_expires_in', EXPIRES_IN_SECS, function(error, result) {
    
    if (error) {
      console.error('error: '+error);
      resultcb();  // empty
    } else {
      // step3. Set expiration time
      redisClient.expire(key, EXPIRES_IN_SECS, function(error, result) {
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

  redisClient.del(key, (error, result) => {
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

  redisClient.ttl(key, (error, result) => {
    if (error) {
      console.error('error: '+error);
      resultcb();  // empty
    } else {
      resultcb(result > 0);  // returns true or false
    }
  });
}

function getAuthTokenValue(token, field, resultcb) {
  var key = tokenAsKey(token);

  redisClient.hget(key, field, (error, result) => {
    if (error) {
      console.error('error: '+error);
      resultcb();  // empty
    } else {
      resultcb(result); 
    }
  });
}

function setAuthTokenValue(token, field, value, resultcb) {
  var key = tokenAsKey(token);

  redisClient.hset(key, field, value, (error, result) => {
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