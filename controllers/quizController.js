import QuizService from "../services/quizService.js";
import SocketService from "../services/socketService.js";

export default class QuizController {
    constructor(io) {
        this.io = io;
        this.quizService = QuizService.getInstance();
        this.socketService = SocketService.getInstance();
    }

    registerEvents(socket) {
        socket.on('ready', ({ launchUsername, receiveUsername, quizId }) => {
            let readyUser = socket.handshake.auth.username
            let opponentUser = readyUser === launchUsername ? receiveUsername : launchUsername;
            console.log(`Received ready event.
                User ${readyUser} is ready to start the quiz with ${opponentUser}.
                Quiz ID: ${quizId}`);
            if (quizId === null) {
                // This is the init state of the quiz, create a new quiz info
                let launchSocketId = this.socketService.getSocketIdByUsername(launchUsername);
                let receiveSocketId = this.socketService.getSocketIdByUsername(receiveUsername);

                const result = this.quizService.updateReadiness(
                    launchUsername,
                    launchSocketId,
                    receiveUsername,
                    receiveSocketId,
                    socket,
                ).then(result => {
                    if (result.ready) {
                        this.io.to(result.launchSocketId).emit('question',{
                            launchUsername: launchUsername,
                            receiveUsername: receiveUsername,
                            questionInfo: this.quizService.getQuestions(result.quizId),
                            quizId: result.quizId,
                        });
                        this.io.to(result.receiveSocketId).emit('question', {
                            launchUsername: launchUsername,
                            receiveUsername: receiveUsername,
                            questionInfo: this.quizService.getQuestions(result.quizId),
                            quizId: result.quizId,
                        });
                    }
                    else {
                        socket.emit('waitingForPartner', {launchUsername, receiveUsername});
                    }
                })
            }
            else {

            }
        })
    }
}