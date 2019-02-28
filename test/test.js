var common = require('../lib/hj212/common.js')
var session = require('../lib/hj212/session')
var crc = require('../lib/hj212/crc')

var t = common.getFormattedTimestamp();
console.log(t, ' ', t.length);

console.log('QN:', session.formatQN());
console.log('QN:', session.formatQN().toString())

console.log('ST:', session.formatST('SYSTEM-INTERACT'),
  ' ', session.formatST('SYSTEM-INTERACT').toString())

console.log('CN:', session.formatCN('PARAM_TIME_UPLOAD'),
  ' ', session.formatCN('PARAM_TIME_UPLOAD').toString());

console.log('Pw:', session.formatPW(), session.formatPW().toString())

console.log('uid:', session.formatUID(), ' ', session.formatUID().toString())

console.log('flag:', session.formatFlag(true, true), ' ', session.formatFlag(true, true).toString())

// 7296 = 0x1C80
console.log('crc:', crc.crc16Hex(Buffer.from('QN=20160801085857223;ST=32;CN=1062;PW=100000;MN=010000A8900016F000169DC0;Flag=5;CP=&&RtdInterval=30&&')));

// console.log('crc:', crc.crc16(Buffer.from('QN=')));
