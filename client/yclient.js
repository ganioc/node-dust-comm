'use strict'
var YClientSessionCtrl = require('./yclientsession').YClientSessionCtrl

function YClient() {
  this.name = 'YMachine'
  this.sessionCtrl = new YClientSessionCtrl()
}

YClient.prototype.start = function (options) {
  // start connection
  this.sessionCtrl.start(options)
}

// --------------------------------------------------
// Command 4
YClient.prototype.timeCalNotify = function (cb) {
  this.notify({
    PolId: 'w01018'
  }, cb)
}
// ----------------------------------------------------

YClient.prototype.notify = function (paramObj, cb) {
  this.sessionCtrl.notify(paramObj, cb)
}

module.exports = {
  YClient: YClient
}
