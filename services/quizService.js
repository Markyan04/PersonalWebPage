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

    getQuestions(quizId) {
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

    updateCurrentQuestionIndex(quizId) {
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

    async updateReadiness(launchUsername, launchSocketId, receiveUsername, receiveSocketId, socket) {
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
            answerResult.creator.result = 'correct';
            answerResult.receiver.result = 'late';
        }
        else if (scores.creatorScore === 0 && scores.receiverScore === 2) {
            answerResult.creator.result = 'late';
            answerResult.receiver.result = 'correct';
        }
        else if (scores.creatorScore === 1 && scores.receiverScore === 0) {
            answerResult.creator.result = 'late but win';
            answerResult.receiver.result = 'wrong';
        }
        else if (scores.creatorScore === 0 && scores.receiverScore === 1) {
            answerResult.creator.result = 'wrong';
            answerResult.receiver.result = 'late but win';
        }
        else if (scores.creatorScore === 0 && scores.receiverScore === 0) {
            answerResult.creator.result = 'late';
            answerResult.receiver.result = 'late';
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
}

export default QuizService;
