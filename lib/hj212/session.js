var EE = require('events');
var util = require('util');
var COMMON = require('./common');

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

function createFrame(data) {
  // add head, crc, tail
}

function SessionClass() {
  EE.call(this);
  this.name = 'Session';
  this.lst = [];
}
util.inherits(SessionClass, EE);

SessionClass.prototype.addSession = function (packet) {
  this.lst.push({
    packet: packet,
    id: this.getId(packet)
  });
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
  return true;
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
  createFrame: createFrame
}
