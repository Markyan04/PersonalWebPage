const socketIo = require('socket.io');

let io;

exports.init = (server) => {
  io = socketIo(server);

  io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('setName', (username) => {
      console.log(`User set name: ${username}`);
      socket.username = username;
    })

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.username || 'Unknown'}`);
    });
  });
}

exports.getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}