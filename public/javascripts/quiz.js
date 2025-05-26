import { socket } from './socket/index.js';
import Timer from './utils/timer.js';
import { QuizPageManager } from "./utils/page.js";

let currentQuestionIndex = 0;
let currentSelectionIndex = null;
let currentPlayerTotalScore = '0';
let currentOpponentTotalScore = '0';
let localLaunchUsername = '';
let localReceiveUsername = '';
let pointForThisQuestion = 'Unknown';
const totalQuestions = 10;
const onCompetitionText = "On competition and waiting for result.";
const winAndGetPoint = "You are correct and faster than your opponent.";
const wrongAndNoPoint = "You are faster but you are wrong.";
const slowAndNoPoint = "Your opponent is faster and he is correct.";
const slowAndGetPoint = "Your opponent is faster but he is wrong.";

let questionTimer = new Timer(30, () => {
    if (currentSelectionIndex !== null) {
        uploadAnswer();
    }
    else {
        socket.emit('uploadAnswer', {
            launchUsername: localLaunchUsername,
            receiveUsername: localReceiveUsername,
            answer: null,
            quizId: localStorage.getItem('quizId'),
        })
        QuizPageManager.uploadAnswerButNoResultState();
    }
});

const beforeAnswerStateResponsiveChange = () => {
    document.getElementById('current-score').textContent = pointForThisQuestion;
    document.getElementById('total-score').textContent = currentPlayerTotalScore;
    document.getElementById('opponent-total-score').textContent = currentOpponentTotalScore;
    document.querySelector('.progress-bar').style.width = `${(currentQuestionIndex + 1 / totalQuestions) * 100}%`;
    document.querySelector('.progress-text').textContent = `${currentQuestionIndex + 1}/${totalQuestions}`;
    document.querySelector('.result-text').textContent = onCompetitionText;
    questionTimer.reset();
    questionTimer.onUpdate = (remaining) => {
        document.getElementById('timer').textContent = remaining;
    };
    questionTimer.start();
}

const clickOption = (index, optionItem) => {
    if (currentSelectionIndex === null) {
        optionItem.classList.add('selected');
        currentSelectionIndex = index;
    }
    else {
        if (currentSelectionIndex === index) {
            optionItem.classList.remove('selected');
            currentSelectionIndex = null;
        }
        else {
            document.getElementById(`option-item-${currentSelectionIndex + 1}`).classList.remove('selected');
            optionItem.classList.add('selected');
            currentSelectionIndex = index;
        }
    }
}

const renderQuestion = (questionInfo) => {
    document.getElementById('question-text').textContent = questionInfo.question;
    questionInfo.options.forEach((option, index) => {
        let optionItem = document.getElementById(`option-item-${index + 1}`)
        optionItem.textContent = option;
        optionItem.addEventListener('click', () => clickOption(index, optionItem))
    })
}

const getUrlParams = () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    return {
        launchUsername: urlParams.get('launchUsername'),
        receiveUsername: urlParams.get('receiveUsername')
    };
};

const startQuiz = (launchUsername, receiveUsername) => {
    QuizPageManager.readyButtonClick();
    socket.emit('ready', {
        launchUsername: launchUsername,
        receiveUsername: receiveUsername,
        quizId: null,
    })
}

const uploadAnswer = () => {
    if (currentSelectionIndex === null) {
        alert("Please select an answer");
        return;
    }
    questionTimer.stop();
    socket.emit('uploadAnswer', {
        launchUsername: localLaunchUsername,
        receiveUsername: localReceiveUsername,
        answer: currentSelectionIndex,
        quizId: localStorage.getItem('quizId'),
    })
    QuizPageManager.uploadAnswerButNoResultState();
}

const registerQuizEvents = () => {
    socket.on('waitingForPartner', ({ launchUsername, receiveUsername }) => {
        console.log("Waiting for partner");
    });

    socket.on('question', ({ launchUsername, receiveUsername, questionInfo, quizId }) => {
        console.log("Question received");
        localStorage.setItem('quizId', quizId);
        QuizPageManager.enterTestPage();
        renderQuestion(questionInfo);
        QuizPageManager.beforeAnswerState();
        beforeAnswerStateResponsiveChange();
    })

    socket.on('result', ({ launchUsername, receiveUsername, result, quizId }) => {
        alert(result);
        console.log("Result received");
    });

    socket.on('authSuccess', (username) => {
        const loading = document.getElementById('initial-loading');
        if (loading) loading.style.display = 'none';
    });

    socket.on('authFailed', (username) => {
        const loading = document.getElementById('initial-loading');
        localStorage.removeItem('username');
        if (loading) {
            loading.innerHTML = `
                <div style="
                    text-align: center;
                    background: #fff0f3;
                    padding: 2rem;
                    border-radius: 12px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                    border: 1px solid #ffd6dd;
                    max-width: 400px;
                    margin: 1rem;
                ">
                    <h2 style="
                        color: #e74c3c;
                        margin: 0 0 1rem;
                        font-size: 1.8rem;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 0.5rem;
                    ">
                        <span style="font-size: 2rem">❌</span>
                        Authentication Failed
                    </h2>
                    <button 
                        onclick="window.location.href='/login'"
                        style="
                            background: linear-gradient(135deg, #ff6b6b, #ff8787);
                            color: white;
                            border: none;
                            padding: 0.8rem 2rem;
                            border-radius: 25px;
                            font-size: 1rem;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            box-shadow: 0 3px 8px rgba(231, 76, 60, 0.2);
                        "
                        onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 5px 12px rgba(231, 76, 60, 0.3)'"
                        onmouseout="this.style.transform='none'; this.style.boxShadow='0 3px 8px rgba(231, 76, 60, 0.2)'"
                    >
                        Re-login
                    </button>
                </div>
            `;
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    QuizPageManager.readyPageInit();
    socket.emit('quizConnected');
    registerQuizEvents();

    const { launchUsername, receiveUsername } = getUrlParams();
    if (launchUsername && receiveUsername) {
        localLaunchUsername = launchUsername;
        localReceiveUsername = receiveUsername;
    }

    document.getElementById('start-button')
            .addEventListener('click', () => {
                startQuiz(launchUsername, receiveUsername);
            })

    document.getElementById('upload-button')
            .addEventListener('click', () => uploadAnswer())
})