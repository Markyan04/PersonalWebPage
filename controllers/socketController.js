import SocketService from '../services/socketService.js';
import MatchingController from './matchingController.js';
import QuizController from './quizController.js';
import QuizService from "../services/quizService.js";

class SocketController {
    constructor(io) {
        this.io = io;
        this.service = SocketService.getInstance();
        this.quizService = QuizService.getInstance();
        this.matchingController = new MatchingController(io);
        this.quizController = new QuizController(io);
    }

    handleConnection(socket) {
        socket.on('firstConnected', () => {
            const { username } = socket.handshake.auth;
            let queryResult = this.service.queryUser(username, socket.id);
            if (queryResult.success === false) {
                socket.emit('authFailed', { username });
                return;
            }
            this.service.addOrUpdateUser(socket.id, username);
            socket.emit('authSuccess', { username });
            this.io.emit('onlineUserListUpdated', this.service.getOnlineUsers());
        });

        socket.on('quizConnected', () => {
            const { username } = socket.handshake.auth;
            this.service.addOrUpdateUser(socket.id, username);
            socket.emit('authSuccess', { username });
            this.io.emit('onlineUserListUpdated', this.service.getOnlineUsers());
        })

        socket.on('disconnect', () => {
            const { username } = socket.handshake.auth;
            let deleteResult = this.service.removeUser(socket.id, username);
            if (deleteResult.success === false) {
                console.log(`User not found: ${socket.id}`);
            }
            let quizId = this.quizService.getQuizIdByUsername(username);
            if (quizId) {
                this.quizService.quizDelete(quizId);
                this.io.emit('quizInterruption', { quizId });
            }
            this.io.emit('onlineUserListUpdated', this.service.getOnlineUsers());
        });

        socket.on('logout', () => {
            const { username } = socket.handshake.auth;
            let deleteResult = this.service.removeUser(socket.id, username);
            if (deleteResult.success === false) {
                console.log(`User not found: ${socket.id}`);
            }
            let quizId = this.quizService.getQuizIdByUsername(username);
            if (quizId) {
                this.quizService.quizDelete(quizId);
                this.io.emit('quizInterruption', { quizId });
            }
            this.io.emit('onlineUserListUpdated', this.service.getOnlineUsers());
        });

        this.matchingController.registerEvents(socket);
        this.quizController.registerEvents(socket);
    }
}

export default SocketController;
