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

    getSocketIdByUsername(username) {
        return this.userList.getSocketIdByUsername(username);
    }

    getQuestions(quizId) {
        let quizInfo = QuizInfo.getQuizById(quizId);
        if (quizInfo) {
            let questionItem = quizInfo.getCurrentQuestion();
            return {
                question: questionItem.text,
                options: questionItem.options,
            }
        }
        else {
            return null;
        }
    }

    updateReadiness(launchUsername, launchSocketId, receiveUsername, receiveSocketId, socket) {
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
            const quizInfo = new QuizInfo(
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
