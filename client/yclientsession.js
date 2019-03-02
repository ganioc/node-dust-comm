'use strict'

var net = require('net')
var SESSIONCTRL = require('../lib/hj212').SESSIONCTRL;
var SessionClass = SESSIONCTRL.SessionClass

function YClientSessionCtrl() {
  this.name = 'yclientsessionctrl'
  this.socket = new net.Socket();
  this.bConnected = false;
  this.sessions = new SessionClass();
}

YClientSessionCtrl.prototype.start = function (options) {
  var that = this;

  this.socket.connect({
    port: options.PORT,
    host: options.IP
  });

  this.socket.on('connect', function () {
    console.log('connected');
    that.bConnected = true;
  });

  this.socket.on('data', function (data) {
    console.log('\nRAW RX:')
    console.log(data);
    console.log('');
    console.log(data.toString())
    // that.frame.consume(data);
    that.sessions.consume(data)
  });
  this.socket.on('end', function () {
    console.log('ended from host');
  })
  this.socket.on('error', function (err) {
    console.log('client error: ', err)
  });

  this.socket.on('close', function () {
    that.bConnected = false;

    console.log('socket closed, try to reconnect')

    setTimeout(function () {
      that.socket.connect({
        port: options.PORT,
        host: options.IP
      });
    }, 5000);
  })
}

module.exports = {
  YClientSessionCtrl: YClientSessionCtrl
}
