'use strict'

var COMMON = require('./common')

var STATE_HANDSHAKE_WAIT = 0;
var STATE_HANDSHAKE_CONFIRM = 1;

var TYPE = {
  PARAM_GET: 100,
  INIT_SET: 101,
  PARAM_SET: 102,
  NOTIFY_UPLINK: 103
}

function Session(options) {
  this.state = STATE_HANDSHAKE_WAIT

  if (options.datasegment === undefined) {
    throw new Error('Session() wrong datasegment')
  }
  this.type = options.type
  this.datasegment = options.datasegment
  this.callback = options.callback
  this.counter = options.recount
  this.overtime = options.overtime
  this.parent = options.handle
  this.machineKey = options.machineKey

  this.timeoutHandle = null
  this.result = '' // to store command result
}

Session.prototype.handle = function (dataseg) {
  if (this.type === TYPE.INIT_SET ||
    this.type === TYPE.PARAM_SET) {
    this.handleInitSet(dataseg)
  } else if (this.type === TYPE.PARAM_GET) {
    this.handleParamGet(dataseg)
  } else if (this.type === TYPE.NOTIFY_UPLINK) {
    this.handleNotify(dataseg)
  } else {
    throw new Error('Unrecognized type,Session.handle');
  }
}
Session.prototype.handleInitSet = function (dataseg) {
  if (this.state === STATE_HANDSHAKE_WAIT && dataseg.CN === COMMON.getUplinkCNCode('REQ_RESP')) {
    this.clearHandshakeTimeout()
    this.state = STATE_HANDSHAKE_CONFIRM
    this.setResultTimeout()
  } else if (this.state === STATE_HANDSHAKE_CONFIRM && dataseg.CN === COMMON.getUplinkCNCode('CMD_RESP')) {
    this.clearResultTimeout();
    this.setResult(dataseg.CP)
    this.parent.emit('finished', this)
  }
}
Session.prototype.handleParamGet = function (dataseg) {
  if (this.state === STATE_HANDSHAKE_WAIT && dataseg.CN === COMMON.getUplinkCNCode('REQ_RESP')) {
    this.clearHandshakeTimeout()
    this.state = STATE_HANDSHAKE_CONFIRM
    this.setResultTimeout()
  } else if (this.state === STATE_HANDSHAKE_CONFIRM && (dataseg.CN === COMMON.getUplinkCNCode('PARAM_TIME_UPLOAD') || dataseg.CN === COMMON.getUplinkCNCode('PARAM_RTDATA_INTERVAL_UPLOAD'))) {
    this.clearResultTimeout()
    this.state = STATE_HANDSHAKE_CONFIRM
    this.setResult(dataseg.CP)
    this.setResultTimeout()
  } else if (this.state === STATE_HANDSHAKE_CONFIRM && dataseg.CN === COMMON.getUplinkCNCode('CMD_RESP')) {
    this.clearResultTimeout();
    this.parent.emit('finished', this)
  }
}
Session.prototype.handleNotify = function (dataseg) {
  if (this.state === STATE_HANDSHAKE_WAIT && dataseg.CN === COMMON.getDownlinkCNCode('NOTIFY_RESP')) {
    this.clearNotifyTimeout();
    this.setResult('feedback=1')
    this.parent.emit('finished', this)
  } else {
    throw new Error('Error: session handleNotify , unrecognized state:' + this.state)
  }
}
Session.prototype.setResult = function (result) {
  this.result = result
}
Session.prototype.checkCounter = function () {
  this.counter--;
  if (this.counter === 0) {
    return false
  } else {
    return true
  }
}
Session.prototype.resetState = function () {
  this.state = STATE_HANDSHAKE_WAIT
  this.result = ''
}
Session.prototype.setHandshakeTimeout = function () {
  var that = this;
  this.timeoutHandle = setTimeout(function () {
    console.log('session handshakeTimeout -*')
    that.parent.emit('timeout', that);
  }, that.overtime);
}

Session.prototype.clearHandshakeTimeout = function () {
  clearTimeout(this.timeoutHandle);
}
Session.prototype.setResultTimeout = function () {
  var that = this;
  this.timeoutHandle = setTimeout(function () {
    console.log('session resultConfirmTimeout --*')
    that.packet.emit('timeout', that)
  }, that.overtime);
}
Session.prototype.clearResultTimeout = function () {
  clearTimeout(this.timeoutHandle);
}
Session.prototype.setNotifyTimeout = function () {
  var that = this
  this.timeoutHandle = setTimeout(function () {
    console.log('session notifyTimeout --*')
    that.packet.emit('timeout', that)
  }, that.overtime)
}
Session.prototype.clearNotifyTimeout = function () {
  clearTimeout(this.timeoutHandle);
}

module.exports = {
  // createNormalSession: createNormalSession,
  Session: Session,
  TYPE: TYPE
}
