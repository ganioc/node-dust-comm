'use strict'

// var net = require('./lib/net');
var CLIENT = require('./yclient').YClient

// const
var PORT = 12405
var IP = '127.0.0.1'

console.log('hello world');

var machine = new CLIENT();

machine.start({
  PORT: PORT,
  IP: IP
});
