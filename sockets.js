const socketIo = require('socket.io');
const SocketController = require('./controllers/socketController');
const SocketService = require('./services/socketService');

let io;

exports.init = (server) => {
  io = socketIo(server, {
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000
    }
  });

  const controller = new SocketController(io);

  io.on('connection', (socket) => {
    // Prevent duplicate connections
    if (socket.recovered) {
      console.log(`Connection recovered: ${socket.id}`);
      return;
    }

    controller.handleConnection(socket);
  });
};