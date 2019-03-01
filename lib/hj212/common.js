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

module.exports = {
  getFormattedTimestamp: getFormattedTimestamp,
  STCode: STCode,
  UplinkCNCode: CNCode['Uplink'],
  DownlinkCNCode: CNCode['Downlink'],
  PASSWORD: PASSWORD,
  UNIQID: UNIQID,
  VERSION: VERSION
}
