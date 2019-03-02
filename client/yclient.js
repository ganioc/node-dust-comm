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

module.exports = {
  YClient: YClient
}
