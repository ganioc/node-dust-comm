'use strict';

var EE = require('events');
var util = require('util');
var CRC16 = require('./crc')

/**
 * packet_head,  2 bytes
 * packet_len,   4 bytes 0255, decimal
 * packet_data   < 1024 bytes
 * packet_crc ,  4 bytes
 * packet_tail,  2 bytes
 */

var STATE_IDLE = 0;
var STATE_HEAD1 = 1;
var STATE_BODY = 3;
var STATE_TAIL1 = 4;

var MAXIMUM_PACKET_LENGTH = 1044;
var PACKET_HEAD1 = 0x23;
var PACKET_HEAD2 = 0x23;
var PACKET_TAIL1 = 0x0D;
var PACKET_TAIL2 = 0x0A;

var stateFrame = STATE_IDLE;
var bufFrame = Buffer.alloc(MAXIMUM_PACKET_LENGTH);
var bufIndex = 0;

function FrameClass() {
  EE.call(this);
  this.name = 'Frame';
  this.txQueue = [];
  this.rxQueue = [];
}
util.inherits(FrameClass, EE);
// rx data to form a valid frame
FrameClass.prototype.consumeFrame = function (data, connKey) {
  console.log('frame.consume()')

  for (var i = 0; i < data.length; i++) {
    var d = data[i];

    switch (stateFrame) {
      case STATE_IDLE:
        if (d === PACKET_HEAD1) {
          stateFrame = STATE_HEAD1;
        }
        break;
      case STATE_HEAD1:
        if (d === PACKET_HEAD2) {
          stateFrame = STATE_BODY;
        } else {
          bufIndex = 0;
          stateFrame = STATE_IDLE;
        }
        break;
      case STATE_BODY:
        if (d === PACKET_TAIL1) {
          stateFrame = STATE_TAIL1;
        } else {
          bufFrame[bufIndex++] = d;
          if (bufIndex > MAXIMUM_PACKET_LENGTH) {
            console.log('Frame buffer overflow!');
            bufIndex = 0;
            stateFrame = STATE_IDLE;
          }
        }
        break;
      case STATE_TAIL1:
        if (d === PACKET_TAIL2) {
          // received correct frame
          var newBuf = Buffer.alloc(bufIndex);
          for (var j = 0; j < newBuf.length; j++) {
            newBuf[j] = bufFrame[j];
          }
          this.emit('frame', {
            buf: newBuf,
            connKey: connKey
          });
        } else {
          console.log('Frame tail wrong!');
        }
        bufIndex = 0;
        stateFrame = STATE_IDLE;
        break;
      default:
        console.log('!!Wrong frame state: ', stateFrame);
        break;
    }
  }
};

// form a valid tx frame
// What is the form of data , then?
/**
 * data: Buffer
 */
FrameClass.prototype.compose = function (data) {
  console.log('frame.compose()')
  var len = data.length + 4;
  var buf = Buffer.alloc(len);
  buf[0] = PACKET_HEAD1;
  buf[1] = PACKET_HEAD2;

  for (var i = 0; i < data.length; i++) {
    buf[2 + i] = data[i];
  }
  buf[len - 2] = PACKET_TAIL1;
  buf[len - 1] = PACKET_TAIL2;

  return buf;
};

FrameClass.prototype.write = function (data, cb) {
  var that = this;
  console.log('\nRAW tx:', data);
  this.txQueue.push({
    data: that.compose(data),
    cb: function () {
      // callback
      cb();
    }
  });
  this.emit('tx', this.txQueue.shift());
}

function createLength(strDataSegment) {
  var len = strDataSegment.length;
  console.log('strLen:', len)
  var strlen = len + '';
  while (strlen.length < 4) {
    strlen = '0' + strlen;
  }
  return strlen;
}
// return Buffer
function createFrame(strDataSegment) {
  // var buf = ;
  var out = '##' + createLength(strDataSegment);
  out += strDataSegment
  out += CRC16.crc16Hex(strDataSegment)
  out += '\r\n'

  console.log('\ncreateFrame()')
  console.log(out)
  console.log(Buffer.from(out));

  console.log('length of Frame:', out.length)

  return Buffer.from(out);
}
// strData without ## \r\n
function checkFrame(strData) {
  console.log('CheckFrame()')
  var bufData = Buffer.from(strData);
  var strlen = bufData.slice(0, 4).toString();
  var bufCrc = bufData.slice(bufData.length - 4, bufData.length)
  var bufDataSegment = bufData.slice(4, bufData.length - 4);

  if (parseInt(strlen) !== bufDataSegment.length) {
    console.log('received:', parseInt(strlen))
    console.log('actual:', bufDataSegment.length)
    console.log('Error:', 'Wrong length')
    return false;
  }

  if (CRC16.crc16Hex(bufDataSegment.toString()) !== bufCrc.toString()) {
    console.log('received:', bufCrc.toString())
    console.log('calculated:', CRC16.crc16Hex(bufDataSegment))
    console.log('Error:', 'Wrong crc')
    return false
  }

  console.log();

  return true;
}
module.exports = {
  FrameClass: FrameClass,
  createFrame: createFrame,
  checkFrame: checkFrame
};
