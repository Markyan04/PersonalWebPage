import crypto from 'crypto';

class QuizInfo {
    static allQuizzes = [];
    static existingIds = new Set();

    constructor(quizCreator, quizCreatorSocketId, quizReceiver, quizReceiverSocketId) {
        this.quizId = QuizInfo.generateQuizId();
        this.quizCreator = quizCreator;
        this.quizCreatorSocketId = quizCreatorSocketId;
        this.quizReceiver = quizReceiver;
        this.quizReceiverSocketId = quizReceiverSocketId;
        this.questions = QuizInfo.loadQuestions();
        this.currentQuestionIndex = 0;
        this.scoreByQuestion = [];
        this.totalScores = {
            creator: 0,
            receiver: 0
        };
        QuizInfo.allQuizzes.push(this);
    }

    static loadQuestions() {
        const questions = require('./question.json');
        return questions.map(q => ({
            text: q.text,
            options: q.options,
            answer: q.answer,
            answerIndex: q.answerIndex
        }));
    }

    static generateQuizId() {
        let newId;
        do {
            newId = crypto.randomUUID();
        } while (QuizInfo.existingIds.has(newId));
        QuizInfo.existingIds.add(newId);
        return newId;
    }

    static removeQuiz(quizId) {
        const index = QuizInfo.allQuizzes.findIndex(q => q.quizId === quizId);
        if (index !== -1) {
            QuizInfo.allQuizzes.splice(index, 1);
            QuizInfo.existingIds.delete(quizId);
        }
    }

    static getQuizById(quizId) {
        return QuizInfo.allQuizzes.find(q => q.quizId === quizId);
    }

    updateScores(questionIndex, creatorScore, receiverScore) {
        this.scoreByQuestion[questionIndex] = { creator: creatorScore, receiver: receiverScore };
        this.totalScores.creator += creatorScore;
        this.totalScores.receiver += receiverScore;
    }

    updateCurrentQuestionIndex() {
        this.currentQuestionIndex++;
    }

    getCurrentQuestion() {
        return this.questions[this.currentQuestionIndex];
    }

    updateCreatorSocketId(socketId) {
        this.quizCreatorSocketId = socketId;
    }

    updateReceiverSocketId(socketId) {
        this.quizReceiverSocketId = socketId;
    }
}

export default QuizInfo;
