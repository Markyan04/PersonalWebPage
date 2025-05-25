import SocketService from '../services/socketService.js';
import MatchingController from './matchingController.js';
import QuizController from './quizController.js';

class SocketController {
    constructor(io) {
        this.io = io;
        this.service = SocketService.getInstance();
        this.matchingController = new MatchingController(io);
        this.quizController = new QuizController(io);
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
            this.io.emit('onlineUserListUpdated', this.service.getOnlineUsers());
        });

        socket.on('disconnect', () => {
            let deleteResult = this.service.removeUser(socket.id);
            if (deleteResult.success === false) {
                console.log(`User not found: ${socket.id}`);
            }
            this.io.emit('onlineUserListUpdated', this.service.getOnlineUsers());
        });

        this.matchingController.registerEvents(socket);
        this.quizController.registerEvents(socket);
    }
}

export default SocketController;
