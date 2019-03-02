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
YMachine.prototype.setOvertimeRecount = function (indMachine, cb) {
  this.sendReq(indMachine, ['OverTime=5', 'ReCount=3'], cb);
}

YMachine.prototype.sendReq = function (indMachine, paramArr, cb) {
  if (!this.sessionCtrl.checkId(indMachine)) {
    cb(new Error('index machine not exist'))
  } else {
    this.sessionCtrl.sendReq(indMachine, paramArr, cb);
  }
}

module.exports = {
  YMachine: YMachine
}
