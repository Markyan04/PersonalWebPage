const SocketService = require('../services/SocketService');

class SocketController {
    constructor(io) {
        this.io = io;
        this.service = SocketService.getInstance();
    }

    handleConnection(socket) {
        socket.on('connected', (username) => {
            socket.userName = username;
            this.service.addUser(socket.id, username);
            socket.emit('authSuccess', { username });
        });

        socket.on('disconnect', () => {
            this.service.removeUser(socket.id);
        });
    }
}

module.exports = SocketController;