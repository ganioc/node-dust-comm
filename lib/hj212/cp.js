'use strict';

function CommandParam() {
  this.name = 'CommandParam';
  this.params = {} // { key:value, key2:value2}
}

CommandParam.prototype.add = function (key, value) {
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
  } else if (typeof obj === 'string') {
    var objParsed = this.parse(obj)
    for (var key2 in objParsed) {
      out.add(key2, objParsed[key])
    }
  }
  return out
}

function flatParam(obj) {
  if (obj === {}) {
    return ''
  }
  var out = createCommandParam(obj);
  return out.output()
}

module.exports = {
  createCommandParam: createCommandParam,
  flatParam: flatParam
}
