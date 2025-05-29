import { v4 as uuidv4 } from 'uuid';
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
        this._questionLoadAbortController = new AbortController();
        QuizInfo.loadQuestions(this._questionLoadAbortController.signal)
                .then(questions => {
                    this.questions = questions;
                })
                .catch(err => {
                    if (err.name !== 'AbortError') {
                        console.error('Question load error:', err);
                    }
                });

        this.currentQuestionIndex = 0;
        this.currentQuestionStartTime = null;
        this.answers = {
            creator: { answer: null, timestamp: null, isCorrect: false },
            receiver: { answer: null, timestamp: null, isCorrect: false }
        };
        this.totalScores = {
            creator: 0,
            receiver: 0
        };
        this.timeLimit = 40000; // A bit longer than 30 seconds

        QuizInfo.allQuizzes.push(this);
    }

    static async createQuiz(quizCreator, quizCreatorSocketId, quizReceiver, quizReceiverSocketId) {
        const instance = new QuizInfo(quizCreator, quizCreatorSocketId, quizReceiver, quizReceiverSocketId);
        instance.questions = await QuizInfo.loadQuestions(instance._questionLoadAbortController.signal);
        return instance;
    }

    static async loadQuestions(signal) {
        try {
            const filePath = path.join(__dirname, '../data/question.json');
            const data = await readFile(filePath, {
                encoding: 'utf8',
                signal
            });
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
            newId = uuidv4();
        } while (QuizInfo.existingIds.has(newId));
        QuizInfo.existingIds.add(newId);
        return newId;
    }

    static getQuizById(quizId) {
        return QuizInfo.allQuizzes.find(q => q.quizId === quizId);
    }

    static removeQuiz(quizId) {
        const index = QuizInfo.allQuizzes.findIndex(q => q.quizId === quizId);
        if (index !== -1) {
            const quiz = QuizInfo.allQuizzes[index];

            if (quiz._questionLoadAbortController) {
                quiz._questionLoadAbortController.abort();
            }

            quiz.questions = null;
            quiz.answers = null;
            quiz.totalScores = null;

            QuizInfo.allQuizzes.splice(index, 1);
            QuizInfo.existingIds.delete(quizId);
        }
    }

    processScores() {
        const currentQuestion = this.getCurrentQuestion();
        if (!currentQuestion) {
            console.log("No current question found, cannot process scores.");
            return;
        }
        let endTime = this.currentQuestionStartTime + this.timeLimit;
        const creatorValid = this.answers.creator.timestamp !== null && this.answers.creator.timestamp <= endTime;
        const receiverValid = this.answers.receiver.timestamp !== null && this.answers.receiver.timestamp <= endTime;
        const validSubmissions = [];
        if (creatorValid) {
            validSubmissions.push({
                player: 'creator',
                answer: this.answers.creator.answer,
                isCorrect: this.answers.creator.isCorrect,
                timestamp: this.answers.creator.timestamp
            });
        }
        if (receiverValid) {
            validSubmissions.push({
                player: 'receiver',
                answer: this.answers.receiver.answer,
                isCorrect: this.answers.receiver.isCorrect,
                timestamp: this.answers.receiver.timestamp
            })
        }

        let creatorScore = 0;
        let receiverScore = 0;
        if (validSubmissions.length === 0) {
            console.log("No valid submissions, cannot process scores.");
            return { creatorScore, receiverScore };
        }

        const fastest = validSubmissions.reduce((prev, current) => {
            return prev.timestamp < current.timestamp ? prev : current;
        });

        if (fastest.isCorrect) {
            if (fastest.player === 'creator') {
                creatorScore = 2;
            }
            else {
                receiverScore = 2;
            }
        }
        else {
            if (fastest.player === 'creator') {
                receiverScore = 1;
            }
            else {
                creatorScore = 1;
            }
        }

        return { creatorScore, receiverScore };
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

    updateTotalScores(creatorScore, receiverScore) {
        this.totalScores.creator += creatorScore;
        this.totalScores.receiver += receiverScore;
    }

    answersInit() {
        this.answers = {
            creator: { answer: null, timestamp: null, isCorrect: false },
            receiver: { answer: null, timestamp: null, isCorrect: false }
        };
    }

    isQuizFinished() {
        return this.currentQuestionIndex === this.questions.length - 1;
    }
}

export default QuizInfo;
