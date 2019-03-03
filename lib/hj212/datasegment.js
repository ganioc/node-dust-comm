'use strict';

var DS_NORMAL_TYPE = 0;
var DS_LONG_TYPE = 1;

function DataSegment() {
  this.name = 'Packet';
  this.type = DS_NORMAL_TYPE

  this.QN = '';
  this.ST = '';
  this.CN = '';
  this.PW = '';
  this.MN = ''; // uniq id
  this.Flag = '';
  this.CP = ''; // parameter list
}
DataSegment.prototype.setQN = function (strQn) {
  this.QN = 'QN=' + strQn;
}
DataSegment.prototype.setST = function (strSt) {
  this.ST = 'ST=' + strSt;
}
DataSegment.prototype.setCN = function (cn) {
  this.CN = 'CN=' + cn;
}
DataSegment.prototype.setPW = function (pw) {
  this.PW = 'PW=' + pw
}
DataSegment.prototype.setMN = function (mn) {
  this.MN = 'MN=' + mn;
}
DataSegment.prototype.setFlag = function (flag) {
  this.Flag = 'Flag=' + flag;
}
DataSegment.prototype.setCP = function (cp) {
  if (typeof cp === 'string') {
    this.CP = 'CP=&&' + cp + '&&';
  } else if (typeof cp === 'object') {
    this.CP = 'CP=&&' + cp.output() + '&&';
  } else {
    throw new Error('Error: datasegment setCP')
  }
}
DataSegment.prototype.push1 = function (out) {
  out.push(this.QN);
  out.push(this.ST);
  out.push(this.CN)
  out.push(this.PW)
  out.push(this.MN)
  out.push(this.Flag)
}
DataSegment.prototype.push2 = function (out) {
  out.push(this.CP)
}

// output -- string
DataSegment.prototype.output = function () {
  var out = [];
  this.push1(out);
  this.push2(out)
  return out.join(';')
}

function LongDataSegment() {
  DataSegment.apply(this)
  this.type = DS_LONG_TYPE
  this.PNUM = '';
  this.PNO = '';
}
LongDataSegment.prototype = new DataSegment();
LongDataSegment.prototype.setPNUM = function (pnum) {
  // console.log('this.PNUM:', this.PNUM)
  this.PNUM = 'PNUM=' + pnum;
}
LongDataSegment.prototype.setPNO = function (pno) {
  this.PNO = 'PNO=' + pno;
}
LongDataSegment.prototype.output = function () {
  var out = [];
  this.push1(out)
  // console.log('Add Pnum, Pno')
  out.push(this.PNUM)
  out.push(this.PNO)
  this.push2(out)

  return out.join(';')
}

function createNormalDataSegment(obj) {
  if (!obj) {
    return new DataSegment();
  }
  if (!obj['QN'] || !obj['ST'] ||
    !obj['CN'] || !obj['PW'] ||
    !obj['MN'] || !obj['Flag']) {
    throw new Error('Error: createNormalDataSegment, wrong input ' + obj.toString());
  }
  var out = new DataSegment()
  out.setQN(obj['QN'])
  out.setST(obj['ST'])
  out.setCN(obj['CN'])
  out.setPW(obj['PW'])
  out.setMN(obj['MN'])
  out.setFlag(obj['Flag'])
  return out
}

function createLongDataSegment(obj) {
  if (!obj) {
    return new LongDataSegment();
  }
  if (!obj['QN'] || !obj['ST'] ||
    !obj['CN'] || !obj['PW'] ||
    !obj['MN'] || !obj['Flag'] ||
    !obj['PNUM'] || !obj['PNO']) {
    throw new Error('Error: createNormalDataSegment, wrong input ' + obj.toString());
  }
  var out = new LongDataSegment()
  out.setQN(obj['QN'])
  out.setST(obj['ST'])
  out.setCN(obj['CN'])
  out.setPW(obj['PW'])
  out.setMN(obj['MN'])
  out.setFlag(obj['Flag'])
  out.setPNUM(obj['PNUM'])
  out.setPNO(obj['PNO'])
  return out
}

function createDataSegment(arr) {
  console.log('createDataSegment()')

  var out = {}

  for (var i = 0; i < arr.length; i++) {
    var match = arr[i].match(/^(.*)=.*$/);
    if (!match) {
      throw new Error('Error: createDataSegment(), wrong item ' + arr[i])
    }
    var key = match[1];
    match = arr[i].match(/^.*=(.*)$/)
    if (!match) {
      throw new Error('Error: createDataSegment(), wrong item ' + arr[i])
    }
    var value = match[1]

    out[key] = value
  }
  if (out['PNUM']) {
    return createLongDataSegment(out);
  } else {
    return createNormalDataSegment(out);
  }
}

function parseDataSegment(strDat) {
  console.log('\nParse string to datasegment')
  // it could be DataSegment or LongDataSegment
  var regMatch = strDat.match(/^(.*);CP=.*&&$/)
  // console.log(regMatch)
  if (!regMatch) {
    throw new Error('Error: parseDataSegment no segment')
  }
  var strSegment = regMatch[1];
  console.log(strSegment)

  regMatch = strDat.match(/.*&&(.*)&&$/);
  // console.log(regMatch)
  if (!regMatch) {
    throw new Error('Error: parseDataSegment no CP');
  }
  var strCP = regMatch[1]
  console.log(strCP)

  // strSegment
  var segLst = strSegment.split(';')
  var dataSegment = createDataSegment(segLst)

  // strCP
  // var cpLst = strCP.split(';')
  dataSegment.setCP(strCP);

  return dataSegment;
}

function cloneNormalDataSegment(ds) {
  var out = createNormalDataSegment();
  out.setQN(ds.QN)
  out.setST(ds.ST)
  out.setCN(ds.CN)
  out.setPW(ds.PW)
  out.setMN(ds.MN)
  out.setFlag(ds.Flag)
  out.setCP(ds.CP)
  return out
}

function cloneLongDataSegment(ds) {
  var out = createLongDataSegment();
  out.setQN(ds.QN)
  out.setST(ds.ST)
  out.setCN(ds.CN)
  out.setPW(ds.PW)
  out.setMN(ds.MN)
  out.setFlag(ds.Flag)
  out.setPNUM(ds.PNUM)
  out.setPNO(ds.PNO)
  out.setCP(ds.CP)

  return out
}

function cloneDataSegment(ds) {
  // long datasegment

  if (ds.PNUM === undefined) {
    return cloneNormalDataSegment(ds)
  } else {
    return cloneLongDataSegment(ds)
  }
}

module.exports = {
  createNormalDataSegment: createNormalDataSegment,
  createLongDataSegment: createLongDataSegment,
  parseDataSegment: parseDataSegment,
  cloneDataSegment: cloneDataSegment
}
