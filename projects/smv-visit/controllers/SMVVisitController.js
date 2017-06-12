'use strict';

const BASE_PATH = '/api/smv/v1/visit';
const AUTH_TOKEN_KEY = 'X-AUTH-TOKEN';
const UPDATABLE_PROPS = ['visitor', 'escort', 'agreement', 'badge'];

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

function cleanseVisitObject(visit) {
  // 
  var id = visit._id || visit.id;
  //var rev = visit._rev || visit.rev;
  //var type = visit.type;
  
  var json = Object.assign(visit, {
    id: id
  });

  json['_id'] = undefined;
  json['_rev'] = undefined;
  json['type'] = undefined;
  json['date'] = new Date(visit.date).toString();

  return json;
}


function newVisit(req, res) {
  //console.log(req.body);
  console.log(`newVisit: visit id ${req.body.id} for ${req.body.visitor.name}`);

  var json = req.body;
  if (json.hasOwnProperty('id')) {
    json['_id'] = String(json.id);
    json['id'] = undefined;
  }
  json['type'] = 'VISIT';
  json['date'] = new Date(json.date).getTime();
  json['updated'] = new Date().getTime();

  mydb.insert(json, function(err, doc) {
    if (err) {
      console.error(err);
      // Error 
      res.statusCode = 500;
      res.end('Internel Server Error');
    } else {
      res.json(cleanseVisitObject(Object.assign(json, doc)));
      res.end();
    }
  });
}

function getVisit(req, res) {
  var docid = req.params.id;

  console.log(`getVisit: visit id ${docid}`);

  mydb.get(docid, function(err, doc) {
    if (err) {
      console.error(err);
      // Error 
      res.statusCode = 500;
      res.end('Internel Server Error');
    } else {
      res.json(cleanseVisitObject(doc));
      res.end();
    }
  });
}

function updateVisit(req, res) {
  var docid = req.params.id;
  
  console.log(`updateVisit: visit id ${docid}`);

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
          jsondoc[key] = Object.assign(jsondoc[key], req.body[key]);
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
          res.json(cleanseVisitObject(jsondoc));
          res.end();
        }
      });
    }
  });
}

function deleteVisit(req, res) {
  var docid = req.params.id;
  
  console.log(`deleteVisit: visit id ${docid}`);

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

/*
- name: date
          description: '방문일시 (ex.1493349000000, 밀리초, 브라우저 시간 기준)'
          in: query
          type: integer
          format: int64
        - name: type
          description: 검색 종류
          in: query
          type: string
          enum:
            - NONE
            - NAME
            - EMAIL
            - CONTACT
        - name: keyword
          description: 검색어
          in: query
          type: string
        - name: page
          description: 페이지 인덱스 (0부터 시작)
          in: query
          type: integer
          format: int32
        - name: size
*/

function searchVisits(req, res) {

  var date = req.query.date;
  var type = req.query.type;
  var keyword = req.query.keyword;
  var page = Number(req.query.page);
  var size = Number(req.query.size);

  console.log(`searchVisits: date=${date}, type=${type}, keyword=${keyword}, page=${page}, size=${size}`);

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
      {'type': 'VISIT'}
    ]
  };
  var queryIndex;
  if (type) {
    var keytype = type.toLowerCase();
    var ekeyword = keyword.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');

    var searchByType = {};
    searchByType[`visitor.${keytype}`] = {'$regex': `(?i)${ekeyword}`}; 

    selector['$and'].push(searchByType);
    //queryIndex = ['_design/smv-visit-indexes', `visitor-${keytype}`];
  }

  if (date) {
    if (new Date(date) == 'Invalid Date') {
      // Error 
      res.statusCode = 400;
      res.end('Invalid Query Parameter: Invalid Date');
      return;
    }

    // Convert date in msec
    var d = new Date(date);
    var sdate = (d.getTime()-1000*(d.getSeconds()+d.getMinutes()*60+d.getHours()*3600)-d.getMilliseconds());
    var edate = (sdate + 24*3600*1000); // The day next

    selector['$and'].push({
      'date': {
        '$gte': sdate
      }
    });
    
    selector['$and'].push({
      'date': {
        '$lt': edate
      }
    });
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
              return cleanseVisitObject(item);
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
  app.post(BASE_PATH, authenticatedFilter, newVisit);

  // Expose search option ahead of general document getting function
  app.get(BASE_PATH + '/search', authenticatedFilter, searchVisits);
  app.get(BASE_PATH + '/:id', authenticatedFilter, getVisit);
  app.put(BASE_PATH + '/:id', authenticatedFilter, updateVisit);
  app.delete(BASE_PATH + '/:id', authenticatedFilter, deleteVisit);
};