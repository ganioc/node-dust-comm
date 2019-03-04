'use strict';
var YMachine = require('./yhost').YMachine

var PORT = 12405

var hostmachine = new YMachine({})

hostmachine.start({
  PORT: PORT
})

// setTimeout(function () {
//   hostmachine.setOvertimeRecount(0, function (err, data) {
//     if (err) {
//       console.log('Error:', err)
//     } else {
//       console.log(data)
//     }
//   })
// }, 8000);

setInterval(function () {
  var machines = hostmachine.getMachines();
  console.log('--------------------------------------')
  console.log('Print machines:')
  for (var i = 0; i < machines.length; i++) {
    console.log('No: ', i)
    console.log('id:', machines[i].id)
    console.log('name:', machines[i].name)
    console.log('')
  }

  console.log('\nPrint sessions:')
  for (var j = 0; j < hostmachine.sessionCtrl.sessions.lst.length; j++) {
    console.log(j, '/ session:')
  }
  console.log('--------------------------------------\n\n')
}, 8000);

// send out after 10 seconds
setTimeout(function () {
  // hostmachine.setOvertimeRecount(0, function (err, data) {
  //   if (err) {
  //     console.log('Host Error:', err)
  //   } else {
  //     console.log('Host Data:', data)
  //   }
  // });
  // hostmachine.getFieldTime(0, function (err, data) {
  //   if (err) {
  //     console.log('Host Error:', err)
  //   } else {
  //     console.log('Host Data:', data)
  //   }
  // })

  // hostmachine.setFieldTime(0, function (err, data) {
  //   if (err) {
  //     console.log('Host Error:', err)
  //   } else {
  //     console.log('Host Data:', data)
  //   }
  // })
  hostmachine.getRTDataInterval(0, function (err, data) {
    if (err) {
      console.log('Host Error:', err)
    } else {
      console.log('Host Data:', data)
    }
  })
}, 10000);
