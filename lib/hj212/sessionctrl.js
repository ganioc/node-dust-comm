var EE = require('events');
var util = require('util');
var COMMON = require('./common');
var Session = require('./session').Session;
var FRAME = require('./frame')
var FrameClass = FRAME.FrameClass
var DS = require('./datasegment')
/**
 * session data format
 * request_encode,        QN ,  20 bytes, timestamp, QN=17 bytes
 *                        Unique session id!!
 * system_encode，        ST, 5 bytes
 * command_encode         CN, 7 bytes
 * secret                  9 bytes
 * uniq_id                 27 bytes
 * flag                    8 bytes
 * total_num               9 bytes
 * packet_num              8 bytes
 * command_parameter       0~950 bytes xx=xx,xxx=xx;xx=x,xx=x;
 * CRC                     4 字节
 */
function formatCP(str) {
  return 'CP=&&' + str + '&&';
}

function formatPNO(num) {
  var buf = Buffer.from(8);
  var bufHead = Buffer.from('PNO=');
  bufHead.copy(buf, 0, 0)

  return buf;
}

function formatPNUM(num) {
  var buf = Buffer.from(9);
  var bufHead = Buffer.from('PNUM=');
  bufHead.copy(buf, 0, 0)
  return buf;
}

// 这里有问题，究竟长度是多少呢？8? 6?
function formatFlag(bNeedResp, bParts) {
  // var buf = Buffer.alloc(8);
  // var bufHead = Buffer.from('Flag=');
  var flag = 0;

  flag = flag + parseInt(COMMON.VERSION);
  if (bNeedResp) {
    flag += 1;
  }
  if (bParts) {
    flag += 2;
  }
  // console.log('flag is', flag)
  // var bufFlag = Buffer.from([flag]);

  // bufHead.copy(buf, 0, 0)
  // bufFlag.copy(buf, 5, 0)
  return 'Flag=' + (flag + '');
}

function formatUID() {
  var buf = Buffer.alloc(27);
  var bufHead = Buffer.from('MN=')
  var bufUID = Buffer.from(COMMON.UNIQID)

  bufHead.copy(buf, 0, 0);
  bufUID.copy(buf, 3, 0);

  return buf;
}

function formatPW() {
  // var buf = Buffer.alloc(9);
  // var bufHead = Buffer.from('PW=');
  // var bufPW = Buffer.from(COMMON.PASSWORD);

  // bufHead.copy(buf, 0, 0)
  // bufPW.copy(buf, 3, 0);

  // return buf;
  return 'PW=' + COMMON.PASSWORD;
}

function formatDownlinkCN(code) {
  if (!COMMON.DownlinkCNCode[code]) {
    throw new Error('session.js formatCN');
  }
  /*   var buf = Buffer.alloc(7);
    var bufCN = Buffer.from('CN=');
    var bufCode = Buffer.from(COMMON.UplinkCNCode[code]);

    bufCN.copy(buf, 0, 0);
    bufCode.copy(buf, 3, 0);
    return buf; */

  return 'CN=' + COMMON.DownlinkCNCode[code];
}

function formatUplinkCN(code) {
  if (!COMMON.UplinkCNCode[code]) {
    throw new Error('session.js formatCN');
  }
  /*   var buf = Buffer.alloc(7);
    var bufCN = Buffer.from('CN=');
    var bufCode = Buffer.from(COMMON.UplinkCNCode[code]);

    bufCN.copy(buf, 0, 0);
    bufCode.copy(buf, 3, 0);
    return buf; */

  return 'CN=' + COMMON.UplinkCNCode[code];
}

function formatST(code) {
  if (!COMMON.STCode[code]) {
    throw new Error('session.js formatST');
  }

  /*   var buf = Buffer.alloc(5);
    var bufST = Buffer.from('ST=');

    var bufCode = Buffer.from(COMMON.STCode[code])

    bufST.copy(buf, 0, 0);
    bufCode.copy(buf, 3, 0);

    return buf; */

  return 'ST=' + COMMON.STCode[code];
}

function formatQN() {
  // var bufTS = Buffer.from(COMMON.getFormattedTimestamp());
  // var buf = Buffer.alloc(20);
  // var bufQN = Buffer.from('QN=');

  // bufTS.copy(buf, 3, 0);
  // bufQN.copy(buf, 0, 0);

  // return buf;

  return 'QN=' + COMMON.getFormattedTimestamp();
}
// return ascii string
function createSetOvertimeRecount() {
  var out = [];
  out.push(formatQN());
  out.push(formatST('SURFACE-WATER-ENV-CONTAM'));
  out.push(formatDownlinkCN('INIT_SETTING_REQ'))
  out.push(formatPW())
  out.push(formatUID())
  out.push(formatFlag(true, false))

  var paramLst = []
  paramLst.push('OverTime=5')
  paramLst.push('ReCount=3')

  out.push(formatCP(paramLst.join(';')))

  return out.join(';');
}

function createDataSegmentDownlink(paramArr) {
  var out = [];
  out.push(formatQN());
  out.push(formatST('SURFACE-WATER-ENV-CONTAM'));
  out.push(formatDownlinkCN('INIT_SETTING_REQ'))
  out.push(formatPW())
  out.push(formatUID())
  out.push(formatFlag(true, false))

  // var paramLst = []
  // paramLst.push('OverTime=5')
  // paramLst.push('ReCount=3')

  out.push(formatCP(paramArr.join(';')))

  return out.join(';');
}

function createDataSegment(paramArr) {
  var out = [];
  out.push(formatQN());
  out.push(formatST('SURFACE-WATER-ENV-CONTAM'));
  out.push(formatDownlinkCN('INIT_SETTING_REQ'))
  out.push(formatPW())
  out.push(formatUID())
  out.push(formatFlag(true, false))

  var paramLst = []
  paramLst.push('OverTime=5')
  paramLst.push('ReCount=3')

  out.push(formatCP(paramLst.join(';')))

  return out.join(';');
}
// dataSegment - string
function createFrame(ds) {
  return FRAME.createFrame(ds)
}

// ///////////////////////////////////////////
// SessionClass
// ///////////////////////////////////////////
function SessionClass() {
  EE.call(this);
  this.name = 'SessionClass';
  this.lst = [];
  this.frame = new FrameClass();
  var that = this;

  this.frame.on('frame', function (data) {
    // remove head and tail
    console.log('sessionctrl on frame ->')
    var dataBuf = data.slice(0, data.length - 0);
    console.log('received frame:', dataBuf.length)
    console.log(dataBuf.toString())

    if (!FRAME.checkFrame(dataBuf.toString())) {
      console.log('Wrong framereceived');
      return -1;
    }

    console.log('Valid frame received')

    var strDataSegment = dataBuf.slice(4, dataBuf.length - 4).toString();

    // put it into sessionlist
    var datasegment = DS.parseDataSegment(strDataSegment);

    console.log(datasegment.output())
    console.log('datasegment type:', datasegment.type)

    // return datasegment;
    that.emit('packet', datasegment)
  })
}
util.inherits(SessionClass, EE);

SessionClass.prototype.addSession = function (options) {
  // var that = this;
  console.log('addSession :')
  // console.log(options)
  var session = new Session(options);

  this.lst.push(session);

  session.setHandshakeTimeout();
}
SessionClass.prototype.findSession = function (dataseg) {
  let session = this.lst.find(function (item) {
    return dataseg.QN === item.datasegment.QN
  });

  if (session) {
    return session
  } else {
    return undefined
  }
}
SessionClass.prototype.getId = function (packet) {
  return packet.split(';')[0]
}
SessionClass.prototype.getPacket = function (id) {
  for (var i = 0; i < this.lst.length; i++) {
    if (this.lst[i].id === id) {
      return i;
    }
  }
  return -1;
}
SessionClass.prototype.removeSession = function (index) {
  if (index < 0 || index >= this.lst.length) {
    return false;
  }
  this.lst.splice(index, 1);
  console.log('session removed:', index)
  return true;
}
SessionClass.prototype.deleteSession = function (session) {
  for (var i = 0; i < this.lst.length; i++) {
    if (session.machineKey === this.lst[i].machineKey) {
      this.removeSession(i)
      return i;
    }
  }
  return -1
}
// input -- Buffer
// output -- datasegment
SessionClass.prototype.consumeFrame = function (data) {
  console.log('Session consumeFrame: ---> ', data.length)

  this.frame.consumeFrame(data);
  /*
  var dataBuf = data.slice(2, data.length - 2);
  console.log(dataBuf.length)
  console.log(dataBuf.toString())

  if (!FRAME.checkFrame(dataBuf.toString())) {
    console.log('Wrong framereceived');
    return -1;
  }

  console.log('Valid frame received')

  var strDataSegment = dataBuf.slice(4, dataBuf.length - 4).toString();

  // put it into sessionlist
  var datasegment = DS.parseDataSegment(strDataSegment);

  console.log(datasegment.output())
  console.log('type:', datasegment.type)

  return datasegment;
  */
}

module.exports = {
  SessionClass: SessionClass,
  // formatQN: formatQN,
  // formatST: formatST,
  // formatCN: formatCN,
  // formatPW: formatPW,
  // formatUID: formatUID,
  // formatFlag: formatFlag,
  // formatPNUM: formatPNUM,
  // formatPNO: formatPNO,
  // cmds formatting
  createSetOvertimeRecount: createSetOvertimeRecount,
  createFrame: createFrame,
  createDataSegment: createDataSegment,
  createDataSegmentDownlink: createDataSegmentDownlink
}
