'use strict'

var common = require('../lib/hj212/common.js')
var session = require('../lib/hj212/session')
var crc = require('../lib/hj212/crc')

var DS = require('../lib/hj212/datasegment')
var CP = require('../lib/hj212/cp')

var YHostSessionCtrl = require('../host/yhostsession.js').YHostSessionCtrl

var t = common.getFormattedTimestamp();
console.log(t, ' ', t.length);

// console.log('QN:', session.formatQN());
// console.log('QN:', session.formatQN().toString())

// console.log('ST:', session.formatST('SYSTEM-INTERACT'),
//   ' ', session.formatST('SYSTEM-INTERACT').toString())

// console.log('CN:', session.formatCN('PARAM_TIME_UPLOAD'),
//   ' ', session.formatCN('PARAM_TIME_UPLOAD').toString());

// console.log('Pw:', session.formatPW(), session.formatPW().toString())

// console.log('uid:', session.formatUID(), ' ', session.formatUID().toString())

// console.log('flag:', session.formatFlag(true, true), ' ', session.formatFlag(true, true).toString())

// 7296 = 0x1C80
console.log('crc:', crc.crc16Hex(Buffer.from('QN=20160801085857223;ST=32;CN=1062;PW=100000;MN=010000A8900016F000169DC0;Flag=5;CP=&&RtdInterval=30&&')));

// console.log('crc:', crc.crc16(Buffer.from('QN=')));
// test datasegments

console.log('\nCheck datasegment')
var ds = DS.createNormalDataSegment();
ds.setQN(common.getFormattedTimestamp())
ds.setST(common.getSTCode('SURFACE-WATER-ENV-CONTAM'))
ds.setCN('1000')
ds.setPW('123456')
ds.setMN(common.UNIQID)
ds.setFlag(common.setFlag(false, true))

var cp = CP.createCommandParam();
cp.add('OverTime', '5');
cp.add('ReCount', 3)

ds.setCP(cp)

console.log(ds.output())
var obj2Data = DS.parseDataSegment(ds.output())
console.log(obj2Data.type)

var dslong = DS.createLongDataSegment();
dslong.setQN(common.getFormattedTimestamp())
dslong.setST(common.getSTCode('SURFACE-WATER-ENV-CONTAM'))
dslong.setCN('1000')
dslong.setPW('123456')
dslong.setMN(common.UNIQID)
dslong.setFlag(common.setFlag(false, true))
dslong.setPNUM('3')
dslong.setPNO(1);
dslong.setCP(CP.createCommandParam({
  OverTime: 5,
  ReCount: 3
}));

console.log(dslong.output())

var objData = DS.parseDataSegment(dslong.output())
console.log(objData.type)

// test segment
var sessionCtrl = new YHostSessionCtrl();

sessionCtrl.sessions.addSession({
  overtime: 5000,
  recount: 3,
  callback: null,
  datasegment: ds,
  handle: sessionCtrl,
  machineKey: '1'
});

console.log(ds.QN)
