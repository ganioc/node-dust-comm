'use strict';
var HJHost = require('./host').HJHost

var PORT = 12405

var hostmachine = new HJHost()

hostmachine.init({
  PORT: PORT
})
