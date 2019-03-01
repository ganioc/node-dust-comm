'use strict'

var EE = require('events');
var util = require('util');
var net = require('net');
var Machine = require('./conn');

function HJHost() {
  EE.call(this);
  this.name = 'HJHost'
  this.socket = null;
  this.machineLst = [];
  this.maxId = 0;
}

util.inherits(HJHost, EE);

HJHost.prototype.init = function (options) {
  this.startServer(options)
}
HJHost.prototype.addMachine = function (conn) {
  this.machineLst.push(conn);
  // console.log(this.machineLst)
  console.log(conn.remoteAddress, ' ', conn.remotePort)
}

HJHost.prototype.removeMachine = function (conn) {
  var ind = this.machineLst.indexOf(conn);
  if (ind >= 0) {
    this.machineLst.splice(ind, 1);
  }
  console.log(this.machineLst)
}

HJHost.prototype.startServer = function (options) {
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
      that.removeMachine(connection);
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
      that.startServer()
    }, 5000);

    console.log('Restart server ...')
  })
}

module.exports = {
  HJHost: HJHost
}
