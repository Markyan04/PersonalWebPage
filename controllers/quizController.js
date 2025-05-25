import QuizService from "../services/quizService.js";

export default class QuizController {
    constructor(io) {
        this.io = io;
        this.quizService = QuizService.getInstance();
    }

    registerEvents(socket) {
        socket.on('ready', ({ launchUsername, receiveUsername, quizId }) => {
            if (quizId === null) {
                // This is the init state of the quiz, create a new quiz info
                const launchSocketId = this.quizService.getSocketIdByUsername(launchUsername);
                const receiveSocketId = this.quizService.getSocketIdByUsername(receiveUsername);

                const result = this.quizService.updateReadiness(
                    launchUsername,
                    launchSocketId,
                    receiveUsername,
                    receiveSocketId,
                    socket,
                );

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
            }
            else {

            }
        })
    }
}