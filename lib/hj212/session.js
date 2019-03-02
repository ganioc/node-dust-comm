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

var STATE_HANDSHAKE_WAIT = 0;
var STATE_HANDSHAKE_CONFIRM = 1;

function Session(options) {
  this.type = options.type;
  this.state = STATE_HANDSHAKE_WAIT
  this.id = options.id;
  this.packet = options.packet;
  this.callback = options.callback;
  this.counter = options.ReCount;
  this.overtime = options.OverTime;
  this.timeoutHandle = null;

  this.parent = options.handle;
}

Session.prototype.setHandshakeTimeout = function () {
  var that = this;
  this.timeoutHandle = setTimeout(function () {
    that.parent.emit('timeout', that.id);
  }, that.overtime);
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
