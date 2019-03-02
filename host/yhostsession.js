'use strict'
var net = require('net')
var EE = require('events');
var util = require('util');

var SESSIONCTRL = require('../lib/hj212').SESSIONCTRL
var SessionClass = SESSIONCTRL.SessionClass;

function YHostSessionCtrl(options) {
  EE.call(this);
  this.name = 'yhostsessionctrl'
  this.socket = null;
  this.bOnline = false;
  this.sessions = new SessionClass(options);

  this.machines = [];

  // parameters which can be changed
  this.OverTime = 5000;
  this.ReCount = 3;

  this.on('timeout', function (data) {
    console.log('timeout:', data)
  })
}
util.inherits(YHostSessionCtrl, EE);

YHostSessionCtrl.prototype.checkId = function (indMachine) {
  return indMachine >= 0 && indMachine < (this.machines.length)
}
YHostSessionCtrl.prototype.removeMachine = function (id) {
  for (var i = 0; i < this.machines.length; i++) {
    if (id === this.machines[i].id) {
      break
    }
  }
  if (i < this.machines.length) {
    this.machines.splice(i, 1);
  }
}
YHostSessionCtrl.prototype.getMachines = function () {
  return this.machines;
}
YHostSessionCtrl.prototype.addMachine = function (conn) {
  conn.key = conn.remoteAddress + ':' + conn.remotePort

  this.machines.push({
    connection: conn,
    name: '',
    id: conn.key
  });

  console.log('add ', conn.key)
}

YHostSessionCtrl.prototype.start = function (options) {
  var that = this;

  this.socket = net.createServer(function (connection) {
    console.log('connected');

    that.addMachine(connection)

    connection.on('data', function (data) {
      console.log('RX', data);
      var buf = Buffer.from([0x23, 0x23, 0x41, 0x42, 0x43, 0x0D, 0x0A]);
      connection.write(buf);
    });
    connection.on('end', function () {
      console.log('Connection ended');
    })
    connection.on('close', function () {
      console.log('connection closed')
      that.removeMachine(connection.key);
    })
  })
  this.socket.listen({
    port: options.PORT,
    host: '0.0.0.0'
  }, function () {
    console.log('server listen on:', options.PORT)
  })

  this.socket.on('error', function (err) {
    console.log('Error:', err)
  })

  this.socket.on('close', function () {
    console.log('Server closed');
    setTimeout(function () {
      that.start(options)
    }, 5000);

    console.log('Restart server ...')
  })
}

YHostSessionCtrl.prototype.sendReq = function (indMachine, paramArr, cb) {
  var that = this;
  var packet = SESSIONCTRL.createDataSegmentDownlink(paramArr);
  // send out using indMachine
  this.machines[indMachine].connection.write(
    SESSIONCTRL.createFrame(packet),
    function () {
      console.log('packet sent out')
    }
  );

  // save it to sessions
  this.sessions.addSession({
    type: 'normal',
    OverTime: this.OverTime,
    ReCount: this.ReCount,
    callback: cb,
    id: this.sessions.getId(packet),
    packet: packet,
    handle: that
  });
}

module.exports = {
  YHostSessionCtrl: YHostSessionCtrl
}
