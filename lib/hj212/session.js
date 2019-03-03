'use strict'
/**
 * 
 * @param
    id: this.getId(packet),
    callback: cb,
    counter: options.ReCount ? options.ReCount : 3,
    timeoutHandle: setTimeout(function () {
      that.emit('timeout',);
    }, options.OverTime ? options.OverTime : 5000)} options
 */
var DS = require('./datasegment')
var COMMON = require('./common')

var STATE_HANDSHAKE_WAIT = 0;
var STATE_HANDSHAKE_CONFIRM = 1;

function Session(options) {
  this.state = STATE_HANDSHAKE_WAIT

  if (options.datasegment === undefined) {
    throw new Error('Session() wrong datasegment')
  }

  this.datasegment = options.datasegment;
  this.callback = options.callback;
  this.counter = options.recount;
  this.overtime = options.overtime;
  this.parent = options.handle;
  this.machineKey = options.machineKey;

  this.timeoutHandle = null;
}
Session.prototype.handle = function (dataseg) {
  if (dataseg.CN === COMMON.getUplinkCNCode('REQ_RESP')) {
    this.clearHandshakeTimeout()
    this.state = STATE_HANDSHAKE_CONFIRM
    this.setConfirmTimeout()
  } else if (dataseg.CN === COMMON.getUplinkCNCode('CMD_RESP')) {
    this.parent.emit('finished', this)
  }
}
Session.prototype.setHandshakeTimeout = function () {
  var that = this;
  this.timeoutHandle = setTimeout(function () {
    console.log('session handshakeTimeout -*')
    that.parent.emit('timeout', that);
  }, that.overtime);
}
Session.prototype.setConfirmTimeout = function () {
  var that = this
  this.timeoutHandle = setTimeout(function () {
    console.log('session resultConfirmTimeout --*')
    that.parent.emit('timeout', that);
  }, that.overtime)
}
Session.prototype.clearHandshakeTimeout = function () {
  clearTimeout(this.timeoutHandle);
}
Session.prototype.setResultTimeout = function () {
  var that = this;
  this.timeoutHandle = setTimeout(function () {
    that.packet.emit('timeout', that.id)
  }, that.overtime);
}
Session.prototype.clearResultTimeout = function () {
  clearTimeout(this.timeoutHandle);
}

// function createNormalSession(options) {
//   var session = new Session(options);
//   session.prototype.run = function () {

//   }
//   return session;
// }
module.exports = {
  // createNormalSession: createNormalSession,
  Session: Session
}
