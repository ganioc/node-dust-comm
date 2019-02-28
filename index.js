'use strict'

// var net = require('./lib/net');
var MACHINE = require('./lib/hj212').HJClass

// const
var PORT = 12405
var IP = '42.159.86.15'

console.log('hello world');

var machine = new MACHINE();

machine.init({
  PORT: PORT,
  IP: IP
});

setInterval(function () {
  machine.write('hello', function () {
    console.log('machine write out');
  });
}, 5000);
