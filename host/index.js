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
  console.log('\nPrint machines:')
  for (var i = 0; i < machines.length; i++) {
    console.log('No: ', i)
    console.log('id:', machines[i].id)
    console.log('name:', machines[i].name)
    console.log('')
  }
}, 8000);

// send out after 10 seconds
setTimeout(function () {
  hostmachine.setOvertimeRecount(0, function (err, data) {
    if (err) {
      console.log('Error:', err)
    } else {
      console.log('Data', data)
    }
  });
}, 10000);
