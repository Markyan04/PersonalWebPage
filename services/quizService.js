import UserList from '../model/userList.js';
import QuizInfo from '../model/quizInfo.js';

class QuizService {
    static instance = null;

    constructor() {
        this.userList = UserList.getInstance();
        this.readinessPool = {};
    }

    static getInstance() {
        if (!QuizService.instance) {
            QuizService.instance = new QuizService();
        }
        return QuizService.instance;
    }

    updateAndReInitQuizProcessInfo(quizId) {
        this.updateQuestionIndex(quizId);
        this.updateCurrentQuestionStartTime(quizId);
        let quizEvent = QuizInfo.getQuizById(quizId);
        quizEvent.answersInit();
    }

    getQuestionsNoAnswer(quizId) {
        let quizEvent = QuizInfo.getQuizById(quizId);
        if (quizEvent) {
            let questionItem = quizEvent.getCurrentQuestion();
            return {
                question: questionItem.text,
                options: questionItem.options,
            }
        }
        else {
            return null;
        }
    }

    getQuizById(quizId) {
        return QuizInfo.getQuizById(quizId);
    }

    getQuizIdByUsername(username) {
        for (const quiz in QuizInfo.allQuizzes) {
            if (QuizInfo.allQuizzes[quiz].quizCreator === username || QuizInfo.allQuizzes[quiz].quizReceiver === username) {
                return QuizInfo.allQuizzes[quiz].quizId;
            }
        }
        return null;
    }

    updateQuestionIndex(quizId) {
        let quizEvent = QuizInfo.getQuizById(quizId);
        if (quizEvent) {
            quizEvent.updateCurrentQuestionIndex();
        }
    }

    updateCurrentQuestionStartTime(quizId) {
        let quizEvent = QuizInfo.getQuizById(quizId);
        if (quizEvent) {
            quizEvent.currentQuestionStartTime = Date.now();
        }
    }

    async updateReadiness(launchUsername, launchSocketId, receiveUsername, receiveSocketId, socket, quizId) {
        const key = `${launchUsername}-${receiveUsername}`;
        
        if (!this.readinessPool[key]) {
            this.readinessPool[key] = {
                launchReady: false,
                receiveReady: false,
                launchSocketId,
                receiveSocketId,
            };
        }

        const pool = this.readinessPool[key];
        if (socket.id === launchSocketId) {
            pool.launchReady = true;
        }

        if (socket.id === receiveSocketId) {
            pool.receiveReady = true;
        }

        if (pool.launchReady && pool.receiveReady) {
            if (quizId !== null) {
                let quizItem = QuizInfo.getQuizById(quizId);
                if (quizItem) {
                    delete this.readinessPool[key];
                    return {
                        ready: true,
                        quizId: quizId,
                        launchSocketId: pool.launchSocketId,
                        receiveSocketId: pool.receiveSocketId
                    }
                }
                else {
                    console.log("Quiz not found");
                }
            }
            else {
                // The Init state of a new quiz
                const quizInfo = await QuizInfo.createQuiz(
                        launchUsername,
                        pool.launchSocketId,
                        receiveUsername,
                        pool.receiveSocketId
                );
                delete this.readinessPool[key];
                return {
                    ready: true,
                    quizId: quizInfo.quizId,
                    launchSocketId: pool.launchSocketId,
                    receiveSocketId: pool.receiveSocketId
                };
            }

        }
        return { ready: false };
    }

    uploadUserAnswer(quizId, userType, answer) {
        const quizItem = QuizInfo.getQuizById(quizId);

        if (!quizItem) {
            console.log("Quiz not found");
            return;
        }
        if (quizItem.answers[userType].timestamp !== null) {
            console.log("User has already answered");
            return;
        }

        const currentTime = Date.now();
        if (currentTime > quizItem.currentQuestionStartTime + quizItem.timeLimit) {
            console.log("Time out");
            return;
        }

        const isCorrect = parseInt(answer) === quizItem.getCurrentQuestion().answerIndex;
        quizItem.answers[userType] = {
            answer,
            timestamp: currentTime,
            isCorrect,
        }

        if (quizItem.answers.creator.timestamp !== null && quizItem.answers.receiver.timestamp !== null) {
            return {
                ready: true
            }
        }
        else {
            return {
                ready: false
            }
        }
    }

     handleQuestionScores(quizId) {
        const quizItem = QuizInfo.getQuizById(quizId);
        const scores = quizItem.processScores();
        quizItem.updateTotalScores(scores.creatorScore, scores.receiverScore);
        let questionWithAnswer = quizItem.getCurrentQuestion()
        let answerResult = {
            creator: {
                result: null,
            },
            receiver: {
                result: null,
            }
        }
        if (scores.creatorScore === 2 && scores.receiverScore === 0) {
            answerResult.creator.result = 'You are correct and faster than your opponent.';
            answerResult.receiver.result = 'Your opponent is faster and he is correct.';
        }
        else if (scores.creatorScore === 0 && scores.receiverScore === 2) {
            answerResult.creator.result = 'Your opponent is faster and he is correct.';
            answerResult.receiver.result = 'You are correct and faster than your opponent.';
        }
        else if (scores.creatorScore === 1 && scores.receiverScore === 0) {
            answerResult.creator.result = 'Your opponent is faster but he is wrong.';
            answerResult.receiver.result = 'You are faster but you are wrong.';
        }
        else if (scores.creatorScore === 0 && scores.receiverScore === 1) {
            answerResult.creator.result = 'You are faster but you are wrong.';
            answerResult.receiver.result = 'Your opponent is faster but he is wrong.';
        }
        else if (scores.creatorScore === 0 && scores.receiverScore === 0) {
            answerResult.creator.result = 'Both sides exceeded the time limit';
            answerResult.receiver.result = 'Both sides exceeded the time limit';
        }

        return {
            creator: {
                quizCreator: quizItem.quizCreator,
                quizCreatorSocketId: quizItem.quizCreatorSocketId,
                resultText: answerResult.creator.result,
                currentQuestionScore: scores.creatorScore,
                totalScore: quizItem.totalScores.creator,
                opponentTotalScore: quizItem.totalScores.receiver,
            },
            receiver: {
                quizReceiver: quizItem.quizReceiver,
                quizReceiverSocketId: quizItem.quizReceiverSocketId,
                resultText: answerResult.receiver.result,
                currentQuestionScore: scores.receiverScore,
                totalScore: quizItem.totalScores.receiver,
                opponentTotalScore: quizItem.totalScores.creator,
            },
            questionBody: questionWithAnswer
        }
    }

    checkIfQuizFinished(quizId) {
        const quizItem = QuizInfo.getQuizById(quizId);
        if (quizItem) {
            return quizItem.isQuizFinished();
        }
    }

    bothReadyToDeleteCheck(launchUsername, launchSocketId, receiveUsername, receiveSocketId, socket) {
        const key = `${launchUsername}-${receiveUsername}`;

        if (!this.readinessPool[key]) {
            this.readinessPool[key] = {
                launchReady: false,
                receiveReady: false,
                launchSocketId,
                receiveSocketId,
            };
        }

        const pool = this.readinessPool[key];
        if (socket.id === launchSocketId) {
            pool.launchReady = true;
        }

        if (socket.id === receiveSocketId) {
            pool.receiveReady = true;
        }

        if (pool.launchReady && pool.receiveReady) {
            delete this.readinessPool[key];
            return {
                ready: true,
            };
        }
        else {
            return {
                ready: false,
            };
        }
    }

    quizDelete(quizId) {
        const quizItem = QuizInfo.getQuizById(quizId);
        let launchUsername = null;
        let receiveUsername = null;
        let launchSocketId = null;
        let receiveSocketId = null;
        if (quizItem) {
            launchUsername = quizItem.quizCreator;
            receiveUsername = quizItem.quizReceiver;
            launchSocketId = quizItem.quizCreatorSocketId;
            receiveSocketId = quizItem.quizReceiverSocketId;
        }
        QuizInfo.removeQuiz(quizId);
        this.userList.removeOnCompetitionUser(launchSocketId, launchUsername);
        this.userList.removeOnCompetitionUser(receiveSocketId, receiveUsername);
        return {
            launchUsername: launchUsername,
            receiveUsername: receiveUsername,
            launchSocketId: launchSocketId,
            receiveSocketId: receiveSocketId,
        }
    }
}

export default QuizService;
