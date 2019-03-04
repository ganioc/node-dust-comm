'use strict'

var EE = require('events');
var util = require('util');
var net = require('net')
var HJ212 = require('../lib/hj212')
var SESSIONCTRL = HJ212.SESSIONCTRL;
var SessionClass = SESSIONCTRL.SessionClass
var COMMON = HJ212.COMMON
var CP = HJ212.CommandParam
var DS = HJ212.DS
var SESSION = HJ212.SESSION

function YClientSessionCtrl() {
  EE.call(this);
  this.name = 'yclientsessionctrl'
  this.socket = new net.Socket();
  this.bConnected = false;
  this.sessions = new SessionClass();

  var that = this;

  this.on('timeout', function (session) {
    console.log('\nYClientSessionctrl timeout: ------*')
    console.log(session.datasegment)

    if (session.checkCounter()) {
      that.write(session.datasegment.createFrame());
      console.log('reSend out ...... ============>')
      session.resetState()
    } else {
      session.callback(new Error('Error: command failed '), 'NOK')
      // delete this session
      that.sessions.deleteSession(session)
    }
  })

  this.on('finished', function (session) {
    console.log('\nYClientSessionctrl session finished: -----%')
    console.log(session.datasegment)
    session.callback(null, session.result)

    that.sessions.deleteSession(session)
  })

  // input data is a datasegment object
  this.sessions.on('packet', function (indata) {
    var dataseg = indata.ds;
    // var connKey = indata.connKey;
    console.log('\nReceived valid datasegment')

    // if it is a waiting session , do it
    console.log('datasegment:', dataseg)

    // consider to put it into sessions list
    if (COMMON.equal(dataseg.CN, COMMON.getDownlinkCNCode('INIT_SETTING_REQ'))) {
      that.handleInitSettingReq(dataseg)
    } else if (COMMON.equal(dataseg.CN, COMMON.getDownlinkCNCode('PARAM_GETTIME_REQ')) ||
      COMMON.equal(dataseg.CN, COMMON.getDownlinkCNCode('PARAM_GETRTDATA_INTERVAL_REQ'))) {
      that.handleGetParamReq(dataseg)
    } else if (COMMON.equal(dataseg.CN, COMMON.getDownlinkCNCode('PARAM_SETTIME_REQ'))) {
      that.handleSetParam(dataseg)
    } else if (COMMON.equal(dataseg.CN, COMMON.getDownlinkCNCode('NOTIFY_RESP'))) {
      that.handleNotifyRsp(dataseg)
    } else {
      throw new Error('Un recognized CN')
    }
  });
}
util.inherits(YClientSessionCtrl, EE);

YClientSessionCtrl.prototype.start = function (options) {
  var that = this;

  this.socket.connect({
    port: options.PORT,
    host: options.IP
  });

  this.socket.on('connect', function () {
    console.log('connected');
    that.bConnected = true;
  });

  this.socket.on('data', function (data) {
    console.log('\nRAW RX:')
    console.log(data);
    console.log('');
    console.log(data.toString())

    // Wait for EventEmitter to send back datasegment
    that.sessions.consumeFrame(data, '')

    // act according to datasegment
    // that.handleDS(ds)
  });
  this.socket.on('end', function () {
    console.log('ended from host');
  })
  this.socket.on('error', function (err) {
    console.log('client error: ', err)
  });

  this.socket.on('close', function () {
    that.bConnected = false;

    console.log('socket closed, try to reconnect')

    setTimeout(function () {
      that.socket.connect({
        port: options.PORT,
        host: options.IP
      });
    }, 5000);
  })
}
YClientSessionCtrl.prototype.write = function (buf, cb) {
  if (this.bConnected) {
    this.socket.write(buf, function () {
      console.log('send out ==================== >')
      cb(null, 'OK')
    });
  } else {
    console.log('write fail, offline')
    cb(new Error('Offline'), null)
  }
}
YClientSessionCtrl.prototype.sendExeRtn = function (ds, cb) {
  var that = this
  var ds2 = DS.cloneDataSegment(ds)
  ds2.setCN(COMMON.getUplinkCNCode('CMD_RESP'))
  var cp = CP.createCommandParam({
    ExeRtn: 1
  })
  ds2.setCP(cp.output())
  that.write(ds2.createFrame(), function (err, data) {
    if (err) {
      console.log(err);
      return -1
    }
    console.log('Send req result')
    cb()
  })
}
YClientSessionCtrl.prototype.handleInitSettingReq = function (dataseg) {
  var that = this

  var newDs = DS.cloneDataSegment(dataseg)
  newDs.setST(COMMON.getSTCode('SYSTEM-INTERACT'))
  newDs.setCN(COMMON.getUplinkCNCode('REQ_RESP'))
  newDs.setFlag(COMMON.setFlag(false, false))
  var cp = CP.createCommandParam({
    QNRtn: 1
  });
  newDs.setCP(cp.output());

  that.write(newDs.createFrame(), function (err, data) {
    if (err) {
      console.log(err);
      return -1
    }
    console.log('Send req rsp')
  })

  COMMON.setInitSetting(dataseg, function () {
    var ds2 = DS.cloneDataSegment(newDs)
    ds2.setCN(COMMON.getUplinkCNCode('CMD_RESP'))
    var cp = CP.createCommandParam({
      ExeRtn: 1
    })
    ds2.setCP(cp.output())
    that.write(ds2.createFrame(), function (err, data) {
      if (err) {
        console.log(err);
        return -1
      }
      console.log('Send req result')
    })
  })
}

YClientSessionCtrl.prototype.handleGetParamReq = function (dataseg) {
  var that = this

  var newDs = DS.cloneDataSegment(dataseg)
  newDs.setST(COMMON.getSTCode('SYSTEM-INTERACT'))
  newDs.setCN(COMMON.getUplinkCNCode('REQ_RESP'))
  newDs.setFlag(COMMON.setFlag(false, false))
  // var cp = CP.createCommandParam({
  //   QNRtn: 1
  // });
  newDs.setCP(CP.flatParam({
    QNRtn: 1
  }));

  that.write(newDs.createFrame(), function (err, data) {
    if (err) {
      console.log(err);
      return -1
    }
    console.log('Send req rsp')
  })

  COMMON.getParam(dataseg, function (objCP) {
    var ds2 = DS.cloneDataSegment(dataseg)
    // ds2.setCN(COMMON.getUplinkCNCode('CMD_RESP'))
    ds2.setFlag(COMMON.setFlag(false, false))
    // var cp = CP.createCommandParam(objCP)
    ds2.setCP(CP.flatParam(objCP))
    that.write(ds2.createFrame(), function (err, data) {
      if (err) {
        console.log(err);
        return -1
      }
      console.log('Send 2nd req result')
      that.sendExeRtn(newDs, function () {});
    })
  })
}

YClientSessionCtrl.prototype.handleSetParam = function (dataseg) {
  var that = this

  var newDs = DS.cloneDataSegment(dataseg)
  newDs.setST(COMMON.getSTCode('SYSTEM-INTERACT'))
  newDs.setCN(COMMON.getUplinkCNCode('REQ_RESP'))
  newDs.setFlag(COMMON.setFlag(false, false))
  var cp = CP.createCommandParam({
    QNRtn: 1
  });
  newDs.setCP(cp.output());

  that.write(newDs.createFrame(), function (err, data) {
    if (err) {
      console.log(err);
      return -1
    }
    console.log('Send req rsp')
  })

  COMMON.setParam(dataseg, function () {
    var ds2 = DS.cloneDataSegment(newDs)
    ds2.setCN(COMMON.getUplinkCNCode('CMD_RESP'))
    var cp = CP.createCommandParam({
      ExeRtn: 1
    })
    ds2.setCP(cp.output())
    that.write(ds2.createFrame(), function (err, data) {
      if (err) {
        console.log(err);
        return -1
      }
      console.log('Send req result')
    })
  })
}
YClientSessionCtrl.prototype.handleNotifyRsp = function (dataseg) {
  var that = this

  var session = that.sessions.findSession(dataseg);

  if (session) {
    console.log('find session of notify')
    session.handle(dataseg)
  } else {
    console.log('Cannot find session waiting for notifyRsp')
  }
}
// --------------------------------------------------------

YClientSessionCtrl.prototype.notify = function (paramObj, cb) {
  var that = this

  var ds = DS.createNormalDataSegment();
  ds.setQN(COMMON.getFormattedTimestamp())
  ds.setST(COMMON.getSTCode('SURFACE-WATER-ENV-CONTAM'))
  ds.setCN(COMMON.getUplinkCNCode('PARAM_TIMECAL_NOTIFY'))
  ds.setPW(COMMON.PASSWORD)
  ds.setMN(COMMON.UNIQID)
  ds.setFlag(COMMON.setFlag(false, true))
  ds.setCP(CP.flatParam(paramObj))

  that.write(ds.createFrame(), function (err, data) {
    if (err) {
      console.log(err);
      return -1
    }
    console.log('Send req ===============================>')
  })
  that.sessions.addNotifySession({
    type: SESSION.TYPE.NOTIFY_UPLINK,
    overtime: COMMON.OVERTIME,
    recount: COMMON.RECOUNT,
    callback: cb,
    datasegment: ds,
    handle: that,
    machineKey: ''
  })
}

module.exports = {
  YClientSessionCtrl: YClientSessionCtrl
}
