'use strict'

var net = require('net')
var HJ212 = require('../lib/hj212')
var SESSIONCTRL = HJ212.SESSIONCTRL;
var SessionClass = SESSIONCTRL.SessionClass
var COMMON = HJ212.COMMON
var CP = HJ212.CommandParam

function YClientSessionCtrl() {
  this.name = 'yclientsessionctrl'
  this.socket = new net.Socket();
  this.bConnected = false;
  this.sessions = new SessionClass();

  // input data is a datasegment object
  this.sessions.on('packet', function (dataseg) {
    console.log('\nReceived valid datasegment')

    // if it is a waiting session , do it


    // consider to put it into sessions list


  });
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

    // Wait for EventEmitter to send back datasegment
    that.sessions.consumeFrame(data)

    // act according to datasegment
    // that.handleDS(ds)
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
YClientSessionCtrl.prototype.write = function (buf) {
  if (this.bConnected) {
    this.socket.write(buf, function () {});
  }
}
YClientSessionCtrl.prototype.handleDS = function (ds) {
  // consider to put it into session list
  ds.setST(COMMON.getSTCode('SYSTEM-INTERACT'));
  ds.setCN(COMMON.getUplinkCNCode('REQ_RESP'))
  ds.setFlag(COMMON.setFlag(false, false))
  var cp = CP.createCommandParam({
    QNRtn: 1
  });
  ds.setCP(cp.output())

  this.write(SESSIONCTRL.createFrame(ds.output()),
    function () {
      console.log('packet sent out\n\n')
    }
  );
  // start to handle the command and give result

  ds.setCN(COMMON.getUplinkCNCode('CMD_RESP'));
  cp = CP.createCommandParam({
    ExeRtn: 1
  })
  ds.setCP(cp.output());

  this.write(SESSIONCTRL.createFrame(ds.output()),
    function () {
      console.log('packet sent out\n\n')
    })
}

module.exports = {
  YClientSessionCtrl: YClientSessionCtrl
}
