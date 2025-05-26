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
                        this.quizService.updateCurrentQuestionStartTime(result.quizId);
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

        socket.on('uploadAnswer', ({launchUsername, receiveUsername, answer, quizId}) => {
            let readyUser = socket.handshake.auth.username
            let userType = readyUser === launchUsername? 'creator' : 'receiver';
            let opponentUser = readyUser === launchUsername ? receiveUsername : launchUsername;

            console.log(`Received uploadAnswer event.
                User ${readyUser} has finished a question in the quiz with ${opponentUser}.
                Quiz ID: ${quizId}.`);

            let result = this.quizService.uploadUserAnswer(quizId, userType, answer)
            if (result.ready) {
                console.log(`Both users have finished the question.`)
                let scoreResult = this.quizService.handleQuestionScores(quizId);
                if (scoreResult) {
                    console.log(scoreResult)
                    this.io.to(scoreResult.creator.quizCreatorSocketId).emit('result', {
                        launchUsername: launchUsername,
                        receiveUsername: receiveUsername,
                        result: {
                            resultText: scoreResult.creator.resultText,
                            currentQuestionScore: scoreResult.creator.currentQuestionScore,
                            totalScore: scoreResult.creator.totalScore,
                            opponentTotalScore: scoreResult.creator.opponentTotalScore,
                            answer: scoreResult.questionBody.answer,
                            answerIndex: scoreResult.questionBody.answerIndex,
                        },
                        quizId: quizId
                    })
                    this.io.to(scoreResult.receiver.quizReceiverSocketId).emit('result', {
                        launchUsername: launchUsername,
                        receiveUsername: receiveUsername,
                        result: {
                            resultText: scoreResult.receiver.resultText,
                            currentQuestionScore: scoreResult.receiver.currentQuestionScore,
                            totalScore: scoreResult.receiver.totalScore,
                            opponentTotalScore: scoreResult.receiver.opponentTotalScore,
                            answer: scoreResult.questionBody.answer,
                            answerIndex: scoreResult.questionBody.answerIndex,
                        },
                        quizId: quizId
                    })
                }
            }
            else {
                console.log(`Waiting for ${opponentUser} to finish the question.`)
                socket.emit('waitingForOpponentAnswer', {launchUsername, receiveUsername});
            }
        })
    }
}