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

setInterval(function () {
  console.log('--------------------------------------')
  console.log('Print sessions:')
  for (var j = 0; j < machine.sessionCtrl.sessions.lst.length; j++) {
    console.log(j, '/ session:')
  }
  console.log('--------------------------------------\n\n')
}, 8000);

setTimeout(function () {
  machine.timeCalNotify(function (err, data) {
    if (err) {
      console.log('Can not get notify feedback')
      console.log(err)
    }
    console.log('Notify succeed!')
  })
}, 8000)
