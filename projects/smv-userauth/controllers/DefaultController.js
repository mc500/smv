'use strict';

var url = require('url');

var DefaultController = require('./DefaultControllerService');

module.exports.authUserinfoGET = function authUserinfoGET (req, res, next) {
  DefaultController.authUserinfoGET(req.swagger.params, res, next);
};

module.exports.loginPOST = function loginPOST (req, res, next) {
  DefaultController.loginPOST(req.swagger.params, res, next);
};

module.exports.logoutGET = function logoutGET (req, res, next) {
  DefaultController.logoutGET(req.swagger.params, res, next);
};
