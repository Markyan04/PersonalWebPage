import SocketService from '../services/socketService.js';

class SocketController {
    constructor(io) {
        this.io = io;
        this.service = SocketService.getInstance();
    }

    handleConnection(socket) {
        socket.on('connected', (username) => {
            socket.userName = username;
            let addResult = this.service.addUser(socket.id, username);
            if (addResult.success === false) {
                socket.emit('authFailed', { username });
                return;
            }
            socket.emit('authSuccess', { username });

        });

        socket.on('disconnect', () => {
            let deleteResult = this.service.removeUser(socket.id);
            if (deleteResult.success === false) {
                console.log(`User not found: ${socket.id}`);
            }
        });
    }
}

export default SocketController;