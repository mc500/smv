'use strict';

const BASE_PATH = '';
const AUTH_TOKEN_KEY = 'X-AUTH-TOKEN';
const SMV_VISIT_BASE_URL = process.env['SMV_VISIT_BASE_URL'];


const PAGE_WINDOW_SIZE = 5;
const PAGE_SIZE = 10;

var SMVAuthTokenHelper = require('../controllers/SMVAuthTokenHelper'),
  SMVCloudantHelper = require('../controllers/SMVCloudantHelper'),
  mydb = SMVCloudantHelper.initDB('smv');

var request = require('request');

function extractAuthToken(req) {
  //var token = req.headers[AUTH_TOKEN_KEY] || req.headers[AUTH_TOKEN_KEY.toLowerCase()];
  var token = req.cookies[AUTH_TOKEN_KEY];
  if (!token) {
    console.error(`${AUTH_TOKEN_KEY} is not in cookies`);
  }
  return token;
}

function buildAuthHeaders(authtoken) {
  var authheaders = {};
  authheaders[AUTH_TOKEN_KEY] = authtoken;
  return authheaders;
}

function authenticatedFilter(req, res, next) {
  var token = extractAuthToken(req);
  SMVAuthTokenHelper.isValidAuthToken(token, function(valid) {
    //valid = true;
    if (valid) {
      // go next
      return next();
    }

	// redirect to login
    res.redirect(BASE_PATH + '/login');
  });
}


function renderFunction(res, view, obj) {
  obj = obj || {};
  obj['SMV_VISIT_BASE_URL'] = SMV_VISIT_BASE_URL;

  return res.render(view, obj);
}

function getTodayString() {
  var today = new Date();
  return getDateString(today);
}

function getNextDateTimeString() {
  var date = new Date();
  date.setHours(9);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  // next day
  date.setDate(date.getDate()+1);

  return getDateTimeString(date);
}

function getDateString(date) {
  date = date || new Date(); // today

  var year = date.getFullYear();
  var month = date.getMonth()+1;
  var day = date.getDate();

  if (month < 10) {
    month = `0${month}`;
  }
  if (day < 10) {
    day = `0${day}`;
  }

  return `${year}-${month}-${day}`;
}

function getDateTimeString(date) {
  date = date || new Date(); // today

  var year = date.getFullYear();
  var month = date.getMonth()+1;
  var day = date.getDate();
  var hour = date.getHours();
  var min = date.getMinutes();

  if (month < 10) {
    month = `0${month}`;
  }
  if (day < 10) {
    day = `0${day}`;
  }

  if (hour < 10) {
    hour = `0${hour}`;
  }
  if (min < 10) {
    min = `0${min}`;
  }

  return `${year}-${month}-${day}T${hour}:${min}`;
}

function login(req, res) {
  renderFunction(res, 'login.html', {});
}

function register(req, res) {
  var authtoken = extractAuthToken(req);
  SMVAuthTokenHelper.getAuthTokenValue(authtoken, 'userinfo', (result)=>{
      console.log(result);
      var userinfo = JSON.parse(result);
      console.log(userinfo);
      console.log('userinfo.name:'+userinfo.name);
      renderFunction(res, 'visiting/register.html', {
        datetime: getNextDateTimeString(),
        userinfo : userinfo
      });
  });
}

function detail(req, res) {
  console.log(`visiting detail with id : ${req.params.id}`);

  var authtoken = extractAuthToken(req);
  var visitingid = req.params.id;

  // get visit item with id
  request.get({
    url: `${SMV_VISIT_BASE_URL}/api/smv/v1/visit/${visitingid}`,
    headers: buildAuthHeaders(authtoken)
  }, function(error, response, body) {
    if (error) {
      console.log(error);
      return renderFunction(res, 'visiting/detail.html', {
        error: error
      });
    }

    // Check Error Condition
    if (response.statusCode != 200) {
      return renderFunction(res, 'visiting/detail.html', {
        error: `Response with code ${response.statusCode}, ${body}`
      });
    }

    var json = body ? JSON.parse(body) : {};
    console.log(json);

    json.visitingid = visitingid;
    json.ndate = getDateTimeString(new Date(json.date));
    renderFunction(res, 'visiting/detail.html', json);
  });
}

function visitinglist(req, res) {
  console.log(`visiting list`);

  var authtoken = extractAuthToken(req);

  // date
  var date = new Date(req.query.date ? req.query.date : getDateString());
  var keyword = req.query.keyword;
  var type = req.query.type;
  var page = Number(req.query.page);
  var size = req.query.size || PAGE_SIZE;

  console.log(`${SMV_VISIT_BASE_URL}/search`);

  if (Number.isNaN(page) || page < 1) page = undefined;

  // reset type if keyword is empty
  if (!keyword) {
    type = undefined;
  }

  var query = {
    date: date,
    type: type,
    keyword: keyword,
    page: page-1, // page starts with 0
    size: size
  };

  // search 
  request.get({
    url: `${SMV_VISIT_BASE_URL}/api/smv/v1/visit/search`,
    headers: buildAuthHeaders(authtoken),
    qs: query
  }, function(error, response, body) {
    if (error) {
      console.log(error);
      return renderFunction(res, 'visiting/list.html', {
        date: getDateString(date),
        keyword: keyword,
        type: type,
        error: error
      });
    }

    // Check Error Condition
    if (response.statusCode != 200) {
      return renderFunction(res, 'visiting/list.html', {
        date: getDateString(date),
        keyword: keyword,
        type: type,
        error: `Response with code ${response.statusCode}, ${body}`
      });
    }

    var json = body ? JSON.parse(body) : [];

    var paging = json.paging;

    paging.size = paging.size;

    console.log(paging);

    var page = paging.page + 1; // start from 0
    var total = paging.total;
    var pageSize = paging.size;
    var windowSize = PAGE_WINDOW_SIZE;

    var pageinfo = {
      page: page,
      windowSize: windowSize
    };

    // Number of pages
    var npages = Math.ceil(total / pageSize);

    // Prev Window
    if (page > windowSize) {
        var mod = page % windowSize;
        
        pageinfo.prevwindow = page - ((mod != 0)? mod : windowSize);
    }

    // Next Window
    var mod = page % windowSize;
    var p = page + windowSize - ((mod != 0)? mod : windowSize) + 1;
    
    if (p <= npages) {
        pageinfo.nextwindow = p

        // Last Page
        pageinfo.lastpage = npages;
    }

    // Offset
    var off = Math.floor((page - 1) / windowSize) * windowSize;
    var len = Math.min(Math.min(windowSize, npages), npages - off);
    
    pageinfo.pages = [];

    var querystring = require('querystring');

    for(var i=0; i< len; i++) {
      var pagenum = off+i+1;
      query.page = pagenum;
      pageinfo.pages.push({
        page: pagenum,
        query: querystring.stringify({
          date: getDateString(date),
          type: type,
          keyword: keyword,
          page: pagenum,
          size: size
        })
      });
    }

    console.log(`page:${page}`);

    renderFunction(res, 'visiting/list.html', {
      date: getDateString(date),
      datetime: getDateTimeString(date),
      keyword: keyword,
      type: type,
      result: json.result.map((item, idx)=>{        
        var ret = Object.assign({}, item);
        ret.idx = (page - 1) * pageSize + idx + 1;
        // date
        ret.ndate = getDateTimeString(new Date(item.date));
        return ret;
      }),
      pageinfo : pageinfo
    });
  });
}

function confirm(req, res) {
  console.log(`visiting confirm`);

  renderFunction(res, 'visiting/confirm.html', {});
}

function agreement(req, res) {
  console.log(`agreement`);

  renderFunction(res, 'visiting/agreement.html', {
    today: getTodayString()
  });
}

function badgelist(req, res) {
  renderFunction(res, 'badge/list.html', {});
}

function badgeassignee(req, res) {
  renderFunction(res, 'badge/assignee.html', {}); 
}

exports.init = function(app) {
  app.get('/', authenticatedFilter, function(req, res) {
  	// redirect to visiting list
  	res.redirect(BASE_PATH + '/visiting/list');
  });
  app.get(BASE_PATH + '/login', login);
  app.get(BASE_PATH + '/visiting/register', authenticatedFilter, register);
  app.get(BASE_PATH + '/visiting/list', authenticatedFilter, visitinglist);
  app.get(BASE_PATH + '/visiting/detail/:id', authenticatedFilter, detail);
  app.get(BASE_PATH + '/visiting/confirm', authenticatedFilter, confirm);
  app.get(BASE_PATH + '/visiting/agreement', authenticatedFilter, agreement);
  app.get(BASE_PATH + '/badge/list', authenticatedFilter, badgelist);
  app.get(BASE_PATH + '/badge/assignee', authenticatedFilter, badgeassignee);
};