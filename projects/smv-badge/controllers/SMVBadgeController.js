'use strict';

const BASE_PATH = '/api/smv/v1/badge';
const AUTH_TOKEN_KEY = 'X-AUTH-TOKEN';
const DOC_TYPE = 'BADGE';
const UPDATABLE_PROPS = ['type', 'number'];

var SMVAuthTokenHelper = require('./SMVAuthTokenHelper'),
  SMVCloudantHelper = require('./SMVCloudantHelper'),
  mydb = SMVCloudantHelper.initDB('smv');

function extractAuthToken(req) {
  var token = req.headers[AUTH_TOKEN_KEY] || req.headers[AUTH_TOKEN_KEY.toLowerCase()];
  if (!token) {
    console.error(`${AUTH_TOKEN_KEY} is not in the header as key`);
  }
  return token;
}

function authenticatedFilter(req, res, next) {
  var token = extractAuthToken(req);
  SMVAuthTokenHelper.isValidAuthToken(token, function(valid) {
    //valid = true;
    if (valid) {
      // go next
      return next();
    }

    res.statusCode = 401;
    res.end('Unauthorized');
  });
}

function cleanseBadgeObject(badge) {
  // 
  var id = badge._id || badge.id;
  //var rev = badge._rev || badge.rev;
  //var type = badge.type;
  var json = Object.assign({}, badge);
  json['id'] = id;
  json['_id'] = undefined;
  json['_rev'] = undefined;
  json['badgetype'] = undefined;
  json['type'] = badge.badgetype;

  return json;
}


function newBadgeInfo(req, res) {
  //console.log(req.body);
  console.log(`newBadgeInfo: badge id ${req.body.id} for ${req.body.type} with ${req.body.number}`);

  var json = Object.assign({}, req.body);
  if (json.hasOwnProperty('id')) {
    json['_id'] = String(json.id);
    json['id'] = undefined;
  }
  json['type'] = DOC_TYPE;
  json['badgetype'] = req.body.type;
  json['number'] = req.body.number;
  json['updated'] = new Date().getTime();

  mydb.insert(json, function(err, doc) {
    if (err) {
      console.error(err);
      // Error 
      res.statusCode = 500;
      res.end('Internel Server Error');
    } else {
      res.json(cleanseBadgeObject(Object.assign(json, doc)));
      res.end();
    }
  });
}

function getBadgeInfo(req, res) {
  var docid = req.params.id;

  console.log(`getBadgeInfo: badge id ${docid}`);

  mydb.get(docid, function(err, doc) {
    if (err) {
      console.error(err);
      // Error 
      res.statusCode = 500;
      res.end('Internel Server Error');
    } else {
      res.json(cleanseBadgeObject(doc));
      res.end();
    }
  });
}

function updateBadgeInfo(req, res) {
  var docid = req.params.id;
  
  console.log(`updateBadgeInfo: badge id ${docid}`);

  mydb.get(docid, function(err, doc) {
    if (err) {
      console.error(err);
      // Error 
      res.statusCode = 500;
      res.end('Internel Server Error');
    } else {
      var jsondoc = Object.assign({}, doc);
      //console.log(`key:${key}`);
      // Select field to update
      for (var idx in UPDATABLE_PROPS) {
        var key = UPDATABLE_PROPS[idx];
        console.log(`key:${key}`);
        if (req.body.hasOwnProperty(key)) {
          jsondoc[key] = req.body[key];
        }
      }

      jsondoc['updated'] = new Date().getTime();

      mydb.insert(jsondoc, function(err, doc) {
        if (err) {
          console.error(err);
          // Error 
          res.statusCode = 500;
          res.end('Internel Server Error');
        } else {
          // new jsondoc is saved well
          res.json(cleanseBadgeObject(jsondoc));
          res.end();
        }
      });
    }
  });
}

function deleteBadgeInfo(req, res) {
  var docid = req.params.id;
  
  console.log(`deleteBadgeInfo: badge id ${docid}`);

  mydb.get(docid, function(err, doc) {
    if (err) {
      console.error(err);
      // Error 
      res.statusCode = 500;
      res.end('Internel Server Error');
    } else {
      // Delete
      mydb.destroy(doc._id, doc._rev, function(err, doc) {
        if (err) {
          console.error(err);
          // Error 
          res.statusCode = 500;
          res.end('Internel Server Error');
        } else {
          res.end('OK');
        }
      });
    }
  });
}

function searchBadgeInfos(req, res) {

  var type = req.query.type;
  var keyword = req.query.keyword;
  var page = Number(req.query.page);
  var size = Number(req.query.size);

  console.log(`searchBadgeInfos: type=${type}, keyword=${keyword}, page=${page}, size=${size}`);

  if (size && Number.isNaN(size)) {
    // Error 
    res.statusCode = 400;
    res.end('Invalid Query Parameter: the size is NaN');
    return;
  }
  if (page && Number.isNaN(page)) {
    // Error 
    res.statusCode = 400;
    res.end('Invalid Query Parameter: the page is NaN');
    return;
  }
  if (size <= 0) {
    // Error 
    res.statusCode = 400;
    res.end('Invalid Query Parameter: the size is 0 or negative value');
    return;
  }
  if (page <= 0) {
    // Error 
    res.statusCode = 400;
    res.end('Invalid Query Parameter: the page is 0 or negative value');
    return;
  }

  var selector = {
    '$and':[
      {'type': DOC_TYPE}
    ]
  };
  var queryIndex;
  if (type) {
    var keytype = type.toLowerCase();
    if (keytype == 'type') keytype = 'badgetype';
    var ekeyword = keyword.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');

    var searchByType = {};
    searchByType[`${keytype}`] = {'$regex': `(?i)${ekeyword}`}; 

    selector['$and'].push(searchByType);
    //queryIndex = ['_design/smv-badge-indexes', `badge-${keytype}`];
  }

  // console.log('-----------------------------------')
  // console.log(JSON.stringify(selector));
  // console.log('-----------------------------------')

  mydb.find({
    selector: selector,
    fields: ['type'],
    // sort: [{
    //   'date:string': 'desc'
    // }],
    // limit: limit,
    // skip: skip,
    use_index: queryIndex
  }, function(err, totalInfo) {
    if (err) {
      console.error(err);
      // Error 
      res.statusCode = 500;
      res.end('Internel Server Error');
    } else {
      if (totalInfo.warning) {
        console.error(totalInfo.warning);
      }

      console.log(`total count : ${totalInfo.docs.length}`);
      var total = totalInfo.docs.length;

      var limit, skip;
      if (size > 0) {
        limit = size;
        
        // Set the page as last
        var maxpage = Math.floor(total/size-1);
        page = page || 0; // defaul page index is 0

        if (maxpage < page) {
          page = maxpage;
        }
        //console.log(`page:${page}, size:${size}`);
        skip = page * size;
      } else {
        size = undefined;
        page = 0;
      }

      //console.log(`limit:${limit}, skip:${skip}`);

      mydb.find({
        selector: selector,
        // sort: [{
        //   'date:string': 'desc'
        // }],
        limit: limit,
        skip: skip,
        use_index: queryIndex
      }, function(err, result) {

        if (err) {
          console.error(err);
          // Error 
          res.statusCode = 500;
          res.end('Internel Server Error');
        } else {

          console.log(`searched count : ${result.docs.length}`);
          var resObject = {
            result: result.docs.map(function(item){
              return cleanseBadgeObject(item);
            }),
            paging: {
              page: page,
              size: limit,
              total: total
            }
          };

          res.json(resObject);
          res.end();
        }
      });
    }
  });
}

module.exports = function(app, options) {
  app.post(BASE_PATH, authenticatedFilter, newBadgeInfo);

  // Expose search option ahead of general document getting function
  app.get(BASE_PATH + '/search', authenticatedFilter, searchBadgeInfos);
  app.get(BASE_PATH + '/:id', authenticatedFilter, getBadgeInfo);
  app.put(BASE_PATH + '/:id', authenticatedFilter, updateBadgeInfo);
  app.delete(BASE_PATH + '/:id', authenticatedFilter, deleteBadgeInfo);
};