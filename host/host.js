// host code

var net = require('net');

var PORT = 12405

var socket;

function startServer() {
  socket = net.createServer(function (connection) {
    console.log('connected');

    connection.on('data', function (data) {
      console.log('RX', data);
      var buf = Buffer.from([0x23, 0x23, 0x41, 0x42, 0x43, 0x0D, 0x0A]);
      connection.write(buf);
    });
    connection.on('end', function () {
      console.log('Connection ended');
    })
    connection.on('close', function () {
      console.log('connection closed')
    })
  })

  socket.listen({
    port: PORT,
    host: '0.0.0.0'
  }, function () {
    console.log('server listen on:', PORT)
  })

  socket.on('error', function (err) {
    console.log('Error:', err)
  })

  socket.on('close', function () {
    console.log('Server closed');
    setTimeout(function () {
      startServer()
    }, 5000);

    console.log('Restart server ...')
  })
}

startServer()
