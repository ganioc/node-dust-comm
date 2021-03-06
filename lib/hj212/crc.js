// crc16 is tested to be true
'use strict';

// input data is string
function crc16(data) {
  var crc_reg = 0xFFFF;

  for (var i = 0; i < data.length; i++) {
    crc_reg = ((crc_reg >> 8) ^ data[i]) & 0xFFFF;

    for (var j = 0; j < 8; j++) {
      var check = (crc_reg & 0x0001) & 0xFFFF;
      // crc_reg >>= 1;
      crc_reg = (crc_reg >> 1) & 0xFFFF;

      if (check === 0x0001) {
        // crc_reg ^= 0xA001;
        crc_reg = (crc_reg ^ 0xA001) & 0xFFFF
      }
    }
  }
  return crc_reg
}

function crc16Hex(data) {
  console.log('crc16Hex -->')
  console.log('input:', data)
  console.log('crc:', crc16(data).toString(16))

  var out = crc16(data).toString(16)

  while (out.length < 4) {
    out = '0' + out
  }
  return out
}

module.exports = {
  crc16: crc16,
  crc16Hex: crc16Hex
}
