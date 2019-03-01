'use strict'

var EE = require('events');
var util = require('util');
var net = require('net');
var Machine = require('./conn').Machine;

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
HJHost.prototype.showMachine = function(){
  console.log('Print machine list -----')
  for(var i = 0; i< this.machineLst.length; i++){
    var obj = this.machineLst[i];
    console.log('\nid:', obj.id)
    console.log('name:', obj.name)
    console.log('index:', i)
  }
}
HJHost.prototype.addMachine = function (conn) {
  this.machineLst.push(new Machine({
    connection: conn,
    name: '',
    id: conn.remoteAddress + ':' + conn.remotePort
  }));
  // console.log(this.machineLst)
  console.log(conn.remoteAddress, ' ', conn.remotePort)

  conn.key = conn.remoteAddress + ':' + conn.remotePort
  this.showMachine()
}

HJHost.prototype.removeMachine = function (id) {
  for (var i = 0; i < this.machineLst.length; i++) {
    if (id === this.machineLst[i].id) {
      break
    }
  }
  if (i < this.machineLst.length) {
    // delete this.machineLst[i];
	  this.machineLst.splice(i,1);
  }
  // this.showMachine()

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
      that.startServer()
    }, 5000);

    console.log('Restart server ...')
  })
}

module.exports = {
  HJHost: HJHost
}
