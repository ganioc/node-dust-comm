'use strict'
var YHostSessionCtrl = require('./yhostsession.js').YHostSessionCtrl

function YMachine(options) {
  this.name = 'YMachine'
  this.sessionCtrl = new YHostSessionCtrl(options);
}

YMachine.prototype.start = function (options) {
  // start socket server
  this.sessionCtrl.start(options)
}
YMachine.prototype.getMachines = function () {
  return this.sessionCtrl.getMachines()
}
// -------------------------------------------------------
// Command 1 finished
YMachine.prototype.setOvertimeRecount = function (indMachine, cb) {
  this.setReq(indMachine, {
    OverTime: 5,
    ReCount: 3
  }, cb);
}
// Command 2
YMachine.prototype.getFieldTime = function (indMachine, cb) {
  this.getReq(indMachine, {
    PolId: 'w01018'
  }, cb, 'SURFACE-WATER-ENV-CONTAM', 'PARAM_GETTIME_REQ')
}

// Command 3
YMachine.prototype.setFieldTime = function (indMachine, cb) {
  this.setParam(indMachine, {
    PolId: 'w01018',
    SystemTime: '20160801085857'
  }, cb)
}

// Command 5
YMachine.prototype.getRTDataInterval = function (indMachine, cb) {
  this.getReq(indMachine, {}, cb, 'SURFACE-WATER-ENV-CONTAM', 'PARAM_GETRTDATA_INTERVAL_REQ')
}

// ---------------------------------------------------------------
YMachine.prototype.checkIndMachine = function (indMachine, cb) {
  if (!this.sessionCtrl.checkId(indMachine)) {
    cb(new Error('index machine not exist'))
    return false
  }
  return true
}
YMachine.prototype.setReq = function (indMachine, paramObj, cb) {
  if (!this.checkIndMachine(indMachine)) {
    return
  }

  this.sessionCtrl.setReq(indMachine, paramObj, cb);
}

YMachine.prototype.setParam = function (indMachine, paramObj, cb) {
  if (!this.checkIndMachine(indMachine)) {
    return
  }
  this.sessionCtrl.setParam(indMachine, paramObj, cb);
}
YMachine.prototype.getReq = function (indMachine, objParam, cb, stcode, cncode) {
  if (!this.checkIndMachine(indMachine)) {
    return
  }
  this.sessionCtrl.getReq(indMachine, objParam, cb, stcode, cncode);
}

module.exports = {
  YMachine: YMachine
}
