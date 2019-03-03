'use strict';

function CommandParam() {
  this.name = 'CommandParam';
  this.params = {}; // { key:value, key2:value2}
}

CommandParam.prototype.add = function (key, value) {
  // .hasOwnProperty(key)
  if (this.params.hasOwnProperty(key)) {
    throw new Error('Error: datasegemtn.js addParam()');
  }
  this.params[key] = value + '';
}

CommandParam.prototype.output = function () {
  var out = [];

  for (var key in this.params) {
    out.push('' + key + '=' + this.params[key])
  }

  return out.join(';')
}

function createCommandParam(obj) {
  var out = new CommandParam();

  if (typeof obj === 'object') {
    for (var key in obj) {
      out.add(key, obj[key])
    }
  }
  return out
  // return new CommandParam();
}

module.exports = {
  createCommandParam: createCommandParam
}
