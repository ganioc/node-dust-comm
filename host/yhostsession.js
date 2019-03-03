'use strict'
var net = require('net')
var EE = require('events');
var util = require('util');

var HJ212 = require('../lib/hj212')

var SESSIONCTRL = HJ212.SESSIONCTRL
var SessionClass = SESSIONCTRL.SessionClass;
var DS = HJ212.DS;
var COMMON = HJ212.COMMON
var CP = HJ212.CommandParam
var SESSION = HJ212.SESSION

function YHostSessionCtrl(options) {
  EE.call(this);
  this.name = 'yhostsessionctrl'
  this.socket = null;
  this.bOnline = false;
  this.sessions = new SessionClass(options);

  this.machines = [];

  // parameters which can be changed
  this.OverTime = 5000;
  this.ReCount = 3;

  var that = this

  this.on('timeout', function (session) {
    console.log('\nYHostSessionctrl timeout: ----*')

    console.log(session.datasegment)

    if (session.checkCounter()) {
      // resend
      var machine = that.findMachine(session.machineKey);
      if (machine) {
        machine.connection.write(session.datasegment.createFrame());
        console.log('Send out ......')
      } else {
        console.log('Cannot find machine')
      }
      session.resetState()
    } else {
      session.callback(new Error('Error: command failed '), 'NOK')
      // delete this session
      that.sessions.deleteSession(session)
    }
  })
  this.on('finished', function (session) {
    console.log('\nYHostSessionctrl session finished: ----%')
    console.log(session.datasegment)
    session.callback(null, 'OK, got result')

    // delete this session
    that.sessions.deleteSession(session)
  })

  // input data is a datasegment object
  this.sessions.on('packet', function (dataseg) {
    console.log('\nReceived valid datasegment --------------->')

    // search the sessions list to find the waiting session
    that.handleDataSegment(dataseg)
  })
}
util.inherits(YHostSessionCtrl, EE);

YHostSessionCtrl.prototype.checkId = function (indMachine) {
  return indMachine >= 0 && indMachine < (this.machines.length)
}
YHostSessionCtrl.prototype.removeMachine = function (id) {
  for (var i = 0; i < this.machines.length; i++) {
    if (id === this.machines[i].id) {
      break
    }
  }
  if (i < this.machines.length) {
    this.machines.splice(i, 1);
  }
}
YHostSessionCtrl.prototype.getMachines = function () {
  return this.machines;
}
YHostSessionCtrl.prototype.addMachine = function (conn) {
  conn.key = conn.remoteAddress + ':' + conn.remotePort

  this.machines.push({
    connection: conn,
    name: '',
    id: conn.key
  });

  console.log('add ', conn.key)
}
YHostSessionCtrl.prototype.findMachine = function (id) {
  let machine = this.machines.find(function (item) {
    return id === item.id
  })
  if (machine) return machine
  else return undefined
}

YHostSessionCtrl.prototype.start = function (options) {
  var that = this;

  this.socket = net.createServer(function (connection) {
    console.log('connected');

    that.addMachine(connection)

    connection.on('data', function (data) {
      console.log('\n<---')
      console.log('RX', data);
      console.log(data.toString())

      that.sessions.consumeFrame(data);
    });
    connection.on('end', function () {
      console.log('Connection ended');
    })
    connection.on('close', function () {
      console.log('connection closed')
      that.removeMachine(connection.key);
    })
  })
  this.socket.listen({
    port: options.PORT,
    host: '0.0.0.0'
  }, function () {
    console.log('server listen on:', options.PORT)
  })

  this.socket.on('error', function (err) {
    console.log('Error:', err)
  })

  this.socket.on('close', function () {
    console.log('Server closed');
    setTimeout(function () {
      that.start(options)
    }, 5000);

    console.log('Restart server ...')
  })
}

YHostSessionCtrl.prototype.setReq = function (indMachine, paramObj, cb) {
  var that = this;

  var ds = DS.createNormalDataSegment()
  ds.setQN(COMMON.getFormattedTimestamp())
  ds.setST(COMMON.getSTCode('SURFACE-WATER-ENV-CONTAM'))
  ds.setCN(COMMON.getDownlinkCNCode('INIT_SETTING_REQ'))
  ds.setPW(COMMON.PASSWORD)
  ds.setMN(COMMON.UNIQID)
  ds.setFlag(COMMON.setFlag(false, true))

  var cp = CP.createCommandParam(paramObj);
  ds.setCP(cp.output())

  // var packet = SESSIONCTRL.createDataSegmentDownlink(paramArr);
  // send out using indMachine
  this.machines[indMachine].connection.write(
    ds.createFrame(),
    function () {
      console.log('packet sent out\n\n')
    }
  );

  // save it to sessions
  this.sessions.addSession({
    type: SESSION.TYPE.INIT_SET,
    overtime: COMMON.OVERTIME,
    recount: COMMON.RECOUNT,
    callback: cb,
    datasegment: ds,
    handle: that,
    machineKey: that.machines[indMachine].key
  });
}

YHostSessionCtrl.prototype.setParam = function (indMachine, paramObj, cb) {
  var that = this;

  var ds = DS.createNormalDataSegment()
  ds.setQN(COMMON.getFormattedTimestamp())
  ds.setST(COMMON.getSTCode('SURFACE-WATER-ENV-CONTAM'))
  ds.setCN(COMMON.getDownlinkCNCode('PARAM_SETTIME_REQ'))
  ds.setPW(COMMON.PASSWORD)
  ds.setMN(COMMON.UNIQID)
  ds.setFlag(COMMON.setFlag(false, true))

  var cp = CP.createCommandParam(paramObj);
  ds.setCP(cp.output())

  // send out using indMachine
  this.machines[indMachine].connection.write(
    ds.createFrame(),
    function () {
      console.log('packet sent out\n\n')
    }
  );

  // save it to sessions
  this.sessions.addSession({
    type: SESSION.TYPE.PARAM_SET,
    overtime: COMMON.OVERTIME,
    recount: COMMON.RECOUNT,
    callback: cb,
    datasegment: ds,
    handle: that,
    machineKey: that.machines[indMachine].key
  });
}

YHostSessionCtrl.prototype.getReq = function (indMachine, paramObj, cb) {
  var that = this;

  var ds = DS.createNormalDataSegment()
  ds.setQN(COMMON.getFormattedTimestamp())
  ds.setST(COMMON.getSTCode('SURFACE-WATER-ENV-CONTAM'))
  ds.setCN(COMMON.getDownlinkCNCode('PARAM_GETTIME_REQ'))
  ds.setPW(COMMON.PASSWORD)
  ds.setMN(COMMON.UNIQID)
  ds.setFlag(COMMON.setFlag(false, true))

  var cp = CP.createCommandParam(paramObj);
  ds.setCP(cp.output())

  // send out using indMachine
  this.machines[indMachine].connection.write(
    ds.createFrame(),
    function () {
      console.log('packet sent out\n\n')
    }
  );

  // save it to sessions
  this.sessions.addSession({
    type: SESSION.TYPE.PARAM_GET,
    overtime: COMMON.OVERTIME,
    recount: COMMON.RECOUNT,
    callback: cb,
    datasegment: ds,
    handle: that,
    machineKey: that.machines[indMachine].key
  });
}
YHostSessionCtrl.prototype.handleDataSegment = function (ds) {
  console.log('\nHandle received datasegment')
  let session = this.sessions.findSession(ds)
  if (session) {
    console.log('Find session of datasegment')
    // console.log(session)
    session.handle(ds)
  } else {
    console.log('Cannot find datasegment')
  }
}
module.exports = {
  YHostSessionCtrl: YHostSessionCtrl
}
