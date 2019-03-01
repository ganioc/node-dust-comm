'use strict';
var HJHost = require('./host').HJHost

var PORT = 12405

var hostmachine = new HJHost()

hostmachine.init({
  PORT: PORT
})

setTimeout(function () {
  hostmachine.setOvertimeRecount(0, function (err, data) {
    if (err) {
      console.log('Error:', err)
    } else {
      console.log(data)
    }
  })
}, 8000);
