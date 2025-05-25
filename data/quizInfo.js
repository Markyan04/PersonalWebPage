import crypto from 'crypto';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class QuizInfo {
    static allQuizzes = [];
    static existingIds = new Set();

    constructor(quizCreator, quizCreatorSocketId, quizReceiver, quizReceiverSocketId) {
        this.quizId = QuizInfo.generateQuizId();
        this.quizCreator = quizCreator;
        this.quizCreatorSocketId = quizCreatorSocketId;
        this.quizReceiver = quizReceiver;
        this.quizReceiverSocketId = quizReceiverSocketId;
        this.questions = [];
        QuizInfo.loadQuestions().then(questions => {
            this.questions = questions;
        });
        this.currentQuestionIndex = 0;
        this.scoreByQuestion = [];
        this.totalScores = {
            creator: 0,
            receiver: 0
        };
        QuizInfo.allQuizzes.push(this);
    }

    static async createQuiz(quizCreator, quizCreatorSocketId, quizReceiver, quizReceiverSocketId) {
        const instance = new QuizInfo(quizCreator, quizCreatorSocketId, quizReceiver, quizReceiverSocketId);
        instance.questions = await QuizInfo.loadQuestions();
        return instance;
    }

    static async loadQuestions() {
        try {
            const filePath = path.join(__dirname, 'question.json');
            const data = await readFile(filePath, 'utf8');
            return JSON.parse(data).map(q => ({
                text: q.text,
                options: q.options,
                answer: q.answer,
                answerIndex: q.answerIndex
            }));
        } catch (error) {
            console.error('Fail to load question list:', error);
            return [];
        }
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
