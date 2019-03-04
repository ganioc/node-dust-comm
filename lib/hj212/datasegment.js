'use strict';

var FRAME = require('./frame')

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
  this.QN = '' + strQn;
}
DataSegment.prototype.setST = function (strSt) {
  this.ST = '' + strSt;
}
DataSegment.prototype.setCN = function (cn) {
  this.CN = '' + cn;
}
DataSegment.prototype.setPW = function (pw) {
  this.PW = '' + pw
}
DataSegment.prototype.setMN = function (mn) {
  this.MN = '' + mn;
}
DataSegment.prototype.setFlag = function (flag) {
  this.Flag = '' + flag;
}
DataSegment.prototype.setCP = function (cp) {
  if (typeof cp === 'string') {
    this.CP = '' + cp + '';
  } else if (typeof cp === 'object') {
    this.CP = '' + cp.output() + '';
  } else {
    throw new Error('Error: datasegment setCP')
  }
}
DataSegment.prototype.strQN = function () {
  return 'QN=' + this.QN
}
DataSegment.prototype.strST = function () {
  return 'ST=' + this.ST
}
DataSegment.prototype.strCN = function () {
  return 'CN=' + this.CN
}
DataSegment.prototype.strPW = function () {
  return 'PW=' + this.PW
}
DataSegment.prototype.strMN = function () {
  return 'MN=' + this.MN
}
DataSegment.prototype.strFlag = function () {
  return 'Flag=' + this.Flag
}
DataSegment.prototype.strCP = function () {
  return 'CP=&&' + this.CP + '&&'
}

DataSegment.prototype.push1 = function (out) {
  out.push(this.strQN());
  out.push(this.strST());
  out.push(this.strCN())
  out.push(this.strPW())
  out.push(this.strMN())
  out.push(this.strFlag())
}
DataSegment.prototype.push2 = function (out) {
  out.push(this.strCP())
}

// output -- string
DataSegment.prototype.output = function () {
  var out = [];
  this.push1(out);
  this.push2(out)
  return out.join(';')
}
DataSegment.prototype.createFrame = function () {
  return FRAME.createFrame(this.output())
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
  this.PNUM = '' + pnum;
}
LongDataSegment.prototype.setPNO = function (pno) {
  this.PNO = '' + pno;
}
LongDataSegment.prototype.strPNUM = function () {
  return 'PNUM=' + this.PNUM
}
LongDataSegment.prototype.strPNO = function () {
  return 'PNO=' + this.PNO
}
LongDataSegment.prototype.output = function () {
  var out = [];
  this.push1(out)
  // console.log('Add Pnum, Pno')
  out.push(this.strPNUM())
  out.push(this.strPNO())
  this.push2(out)

  return out.join(';')
}

// ////////////////////////////////////////////
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
