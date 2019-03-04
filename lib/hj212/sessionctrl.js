var EE = require('events');
var util = require('util');
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

  this.frame.on('frame', function (indata) {
    var data = indata.buf;
    var connKey = indata.connKey;

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
    that.emit('packet', {
      ds: datasegment,
      connKey: connKey
    })
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
SessionClass.prototype.addNotifySession = function (options) {
  console.log('addNotifySession')
  var session = new Session(options)
  this.lst.push(session);

  session.setNotifyTimeout();
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
SessionClass.prototype.consumeFrame = function (data, connKey) {
  console.log('Session consumeFrame: ---> ', data.length)

  this.frame.consumeFrame(data, connKey);
}

module.exports = {
  SessionClass: SessionClass,
  //
  createFrame: createFrame

}
