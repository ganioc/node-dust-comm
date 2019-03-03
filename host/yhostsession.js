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
  })
  this.on('finished', function (session) {
    console.log('\nYHostSessionctrl session finished: ----%')
    console.log(session.datasegment)
  })

  // input data is a datasegment object
  this.sessions.on('packet', function (dataseg) {
    console.log('\nReceived valid datasegment ----->')

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

YHostSessionCtrl.prototype.sendReq = function (indMachine, paramObj, cb) {
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
    SESSIONCTRL.createFrame(ds.output()),
    function () {
      console.log('packet sent out\n\n')
    }
  );

  // save it to sessions
  this.sessions.addSession({
    // type: 'normal',
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
