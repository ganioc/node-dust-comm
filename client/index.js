'use strict'

// var net = require('./lib/net');
var CLIENT = require('./client').HJClient

// const
var PORT = 12405
var IP = '42.159.86.15'

console.log('hello world');

var machine = new CLIENT();

machine.init({
  PORT: PORT,
  IP: IP
});
