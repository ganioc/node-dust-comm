'use strict'

var EE = require('events');
var util = require('util');
var net = require('net');
// var FRAME = require('./frame').FrameClass;
var SESSION = require('../lib/hj212/sessionctrl').SessionClass;

function HJClass() {
  EE.call(this);
  this.name = 'HJ';
  this.client = new net.Socket();
  this.bConnected = false;

  // this.frame = new FRAME();
  this.session = new SESSION();
};

util.inherits(HJClass, EE);

HJClass.prototype.init = function (options) {
  this.initClient(options);
  this.initFrame(options);
  this.initSession(options);
};
HJClass.prototype.initClient = function (options) {
  this.client.connect({
    port: options.PORT,
    host: options.IP
  });
  var that = this;

  this.client.on('connect', function () {
    console.log('connected');
    that.bConnected = true;
  });

  this.client.on('data', function (data) {
    console.log('\nRAW RX:')
    console.log(data);
    console.log('');
    that.frame.consume(data);
  });
  this.client.on('end', function () {
    console.log('ended from host');
  })
  this.client.on('error', function (err) {
    console.log('client error: ', err)
  });

  this.client.on('close', function () {
    that.bConnected = false;

    console.log('socket closed, try to reconnect')

    setTimeout(function () {
      that.client.connect({
        port: options.PORT,
        host: options.IP
      });
    }, 5000);
  })
}
HJClass.prototype.initFrame = function (options) {
  var that = this;

  this.frame.on('tx', function (bundle) {
    if (that.bConnected) {
      console.log('\nFrame tx -->');
      that.client.write(bundle.data, function () {
        bundle.cb();
      });
    }
  });
  // data -> buffer
  // this.frame.on('rx', function (data) {
  //   console.log('\nFrame Valid rx <--')
  //   console.log(data);

  // });
};
HJClass.prototype.initSession = function (options) {
  var that = this;

  that.session.on('tx', function (data) {

  });
  that.session.on('rx', function (data) {

  });
};

HJClass.prototype.write = function (data, cb) {
  this.frame.write(Buffer.from(data), cb);
};

// session command
HJClass.prototype.upload = function (appdata, cb) {

}
HJClass.prototype.notify = function (appdata, cb) {

}
HJClass.prototype.notifySafe = function (appdata, cb) {

}
HJClass.prototype.response = function (appdata, cb) {

}
module.exports = {
  HJClient: HJClass
}
