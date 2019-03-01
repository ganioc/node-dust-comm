'use strict';

function Machine(options) {
  this.name = options.name
  this.connection = options.connection
  this.id = options.id
}

module.exports = {
  Machine: Machine
}
