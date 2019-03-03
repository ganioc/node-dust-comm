function getFormattedTimestamp() {
  var temp = new Date().toISOString();

  return temp.replace(/T/, '')
    .replace(/\./, '')
    .replace(/ /, '')
    .replace(/-/g, '')
    .replace(/Z/, '')
    .replace(/:/g, '')
}

var STCode = {
  'SURFACE-WATER-QUALITY': '21',
  'AIR-QUALITY': '22',
  'SOUND-ENV-QUALITY': '23',
  'UNDERGROUND-WATER-QUALITY': '24',
  'SURFACE-WATER-ENV-CONTAM': '32',
  'SYSTEM-INTERACT': '91'
}

var CNCode = {
  'Downlink': {
    // Init Commands
    'INIT_SETTING_REQ': '1000', // timeout, retransmit
    // Parameters Command
    'PARAM_GETTIME_REQ': '1011',
    'PARAM_SETTIME_REQ': '1012',
    'PARAM_GETRTDATA_INTERVAL_REQ': '1061',
    'PARAM_SETRTDATA_INTERVAL_REQ': '1062',
    'PARAM_GETMINUTEDATA_INTERVAL_REQ': '1063',
    'PARAM_SETMINUTEDATA_INTERVAL_REQ': '1064',
    'PARAM_SETSECRET_REQ': '1072',
    // Data Commands
    'DATA_CONTAM_RTDATA_REQ': '2011',
    'DATA_STOP_CONTAM_RTDATA_NOTIFY': '2012',
    'DATA_STATUS_REQ': '2021',
    'DATA_STOP_STATUS_REQ': '2022',
    'DATA_CONTAM_DAYDATA_REQ': '2031',
    'DATA_RUNTIME_HISTORY_REQ': '2041',
    'DATA_CONTAM_MINUTEDATA_REQ': '2051',
    'DATA_CONTAM_HOURDATA_REQ': '2061',
    // Control Commands
    'CTRL_ZEROCAL_REQ': '3011',
    'CTRL_RTSAMPLE_REQ': '3012',
    'CTRL_STARTWASH_REQ': '3013',
    'CTRL_COMPARESAMPLE_REQ': '3014',
    'CTRL_KEEPSAMPLE_REQ': '3015',
    'CTRL_SETSAMPLE_PERIOD_REQ': '3016',
    'CTRL_GETSAMPLE_PEROID_REQ': '3017',
    'CTRL_GETSAMPLE_TIME_REQ': '3018',
    'CTRL_GETUNIQID_REQ': '3019',
    'CTRL_GETFIELDINFO_REQ': '3020',
    'CTRL_SETFIELDINFO_REQ': '3020',

    // Interactive Commands
    'NOTIFY_RESP': '9013',
    'DATA_RESP': '9014'

  },
  'Uplink': {
    'PARAM_TIME_UPLOAD': '1011',
    'PARAM_TIMECAL_NOTIFY': '1013',
    'PARAM_RTDATA_INTERVAL_UPLOAD': '1061',
    'PARAM_MINUTEDATA_INTERVAL_UPLOAD': '1063',

    // Data Commands
    'DATA_CONTAM_RTDATA_UPLOAD': '2011',
    'DATA_STATUS_UPLOAD': '2021',
    'DATA_CONTAM_DAYDATA_UPLOAD': '2031',
    'DATA_RUNTIME_HISTORY_UPLOAD': '2041',
    'DATA_CONTAM_MINUTEDATA_UPLOAD': '2051',
    'DATA_CONTAM_HOURDATA_UPLOAD': '2061',
    'DATA_POWERON_TIME_UPLOAD': '2081',

    // Control Commands
    'CTRL_KEEPSAMPLE_UPLOAD': '3015',
    'CTRL_GETSAMPLE_PEROID_UPLOAD': '3017',
    'CTRL_GETSAMPLE_TIME_UPLOAD': '3018',
    'CTRL_GETUNIQID_UPLOAD': '3019',
    'CTRL_GETFIELDINFO_UPLOAD': '3020',

    // Interactive Commands
    'REQ_RESP': '9011',
    'CMD_RESP': '9012',
    'NOTIFY_RESP': '9013',
    'DATA_RESP': '9014'
  }
}

var PASSWORD = '123456';
var UNIQID = '12345678901234567890ABCD';
var VERSION = '4';
var OVERTIME = 5000;
var RECOUNT = 3;

function setFlag(bParts, bNeedResp) {
  var flag = 0;

  flag = flag + parseInt(VERSION);
  if (bNeedResp) {
    flag += 1;
  }
  if (bParts) {
    flag += 2;
  }

  return (flag + '');
}

function getSTCode(code) {
  if (!STCode[code]) {
    throw new Error('Error: getSTCode, not exsist ', code);
  }
  return STCode[code]
}

function getDownlinkCNCode(code) {
  if (!CNCode['Downlink'][code]) {
    throw new Error('Error: getDownlinkCNCode, not exsist ' + code);
  }
  return CNCode['Downlink'][code]
}

function getUplinkCNCode(code) {
  if (!CNCode['Uplink'][code]) {
    throw new Error('Error: getUplinkCNCode, not exsist ' + code);
  }
  return CNCode['Uplink'][code]
}

function setInitSetting(ds, cb) {
  var obj = str2obj(ds.CP)
  for (var key in obj) {
    switch (key) {
      case 'OverTime':
        OVERTIME = parseInt(obj[key]);
        break;
      case 'ReCount':
        RECOUNT = parseInt(obj[key])
        break
      default:
        console.log('Unrecognized item, setInitSetting()')
        break
    }
  }
  cb()
}

function getParam(ds, cb) {
  var obj = str2obj(ds.CP);
  var out;
  for (var key in obj) {
    switch (key) {
      case 'PolId':
        if (obj[key] === 'w01018') {
          out = {
            PolId: 'w01018',
            SystemTime: getFormattedTimestamp()
          }
        }
        break;
      default:
        console.log('Unrecognized item, getParam()')
        break
    }
  }
  cb(out)
}

function setParam(ds, cb) {
  var obj = str2obj(ds.CP);
  var out;
  for (var key in obj) {
    switch (key) {
      case 'PolId':
        if (obj[key] === 'w01018') {
          out = {
            PolId: 'w01018',
            SystemTime: getFormattedTimestamp()
          }
        }
        break
      case 'SystemTime':
        var valTime = obj[key]
        console.log('Modified system time to :', valTime)
        break
      default:
        console.log('Unrecognized item, getParam()')
        break
    }
  }
  cb(out)
}

function str2obj(str) {
  var arr = str.split(';')
  var out = {};

  for (var i = 0; i < arr.length; i++) {
    var match = arr[i].match(/^(.*)=.*$/);
    if (!match) {
      throw new Error('Error: str2obj(), wrong item ' + arr[i])
    }
    var key = match[1];
    match = arr[i].match(/^.*=(.*)$/)
    if (!match) {
      throw new Error('Error: str2obj(), wrong item ' + arr[i])
    }
    var value = match[1]

    out[key] = value
  }
  return out
}

function equal(str1, str2) {
  return str1 + '' === str2
}
module.exports = {
  getFormattedTimestamp: getFormattedTimestamp,
  STCode: STCode,
  UplinkCNCode: CNCode['Uplink'],
  DownlinkCNCode: CNCode['Downlink'],
  PASSWORD: PASSWORD,
  UNIQID: UNIQID,
  VERSION: VERSION,
  OVERTIME: OVERTIME,
  RECOUNT: RECOUNT,

  setFlag: setFlag,
  getSTCode: getSTCode,
  getDownlinkCNCode: getDownlinkCNCode,
  getUplinkCNCode: getUplinkCNCode,
  //
  str2obj: str2obj,
  equal: equal,
  // interface functions
  setInitSetting: setInitSetting,
  getParam: getParam,
  setParam: setParam
}
