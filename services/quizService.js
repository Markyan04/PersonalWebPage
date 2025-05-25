import UserList from '../data/userList.js';
import QuizInfo from '../data/quizInfo.js';

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
}

export default QuizService;
