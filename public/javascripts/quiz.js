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

const logout = () => {
    localStorage.removeItem("username");
    socket.emit('logout');
    window.location.href = "/login";
}

const beforeAnswerStateResponsiveChange = () => {
    currentSelectionIndex = null;
    pointForThisQuestion = 'Unknown';
    document.querySelector('.ready-for-next-button').disabled = false;
    document.getElementById('current-score').textContent = pointForThisQuestion;
    document.getElementById('total-score').textContent = currentPlayerTotalScore;
    document.getElementById('opponent-total-score').textContent = currentOpponentTotalScore;
    document.querySelector('.progress-bar').style.width = `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`;
    document.querySelector('.progress-text').textContent = `${currentQuestionIndex + 1}/${totalQuestions}`;
    document.querySelector('.result-text').textContent = onCompetitionText;
    document.querySelectorAll('.option-item').forEach(optionItem => {
        optionItem.classList.remove('selected');
    })
    questionTimer.reset();
    questionTimer.onUpdate = (remaining) => {
        document.getElementById('timer').textContent = remaining;
    };
    questionTimer.start();
}

const afterReceiveResultResponsiveChange = (result) => {
    document.querySelector('.waiting-for-result').children[0].textContent = 'The Answer is: ' + result.answer + '...';
    document.querySelector('.waiting-for-result').children[1].textContent = ' ' + result.resultText;
    document.querySelector('.result-text').textContent = result.resultText;
    document.querySelector('.result-text').classList.remove('result-late');
    document.querySelector('.result-text').classList.remove('result-correct');
    document.querySelector('.result-text').classList.remove('result-wrong');
    if (parseInt(result.currentQuestionScore) === 2) {
        document.querySelector('.result-text').classList.add('result-correct');
    }
    else if (parseInt(result.currentQuestionScore) === 1) {
        document.querySelector('.result-text').classList.add('result-correct');
    }
    else if (parseInt(result.currentQuestionScore) === 0) {
        if (result.resultText === 'You are faster but you are wrong.') {
            document.querySelector('.result-text').classList.add('result-wrong');
        }
        else {
            document.querySelector('.result-text').classList.add('result-late');
        }
    }

    document.getElementById('current-score').textContent = result.currentQuestionScore;
    pointForThisQuestion = result.currentQuestionScore.toString();
    document.getElementById('total-score').textContent = result.totalScore;
    currentPlayerTotalScore = result.totalScore.toString();
    document.getElementById('opponent-total-score').textContent = result.opponentTotalScore;
    currentOpponentTotalScore = result.opponentTotalScore.toString();
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
        optionItem.clickHandler = () => clickOption(index, optionItem)
        optionItem.addEventListener('click', optionItem.clickHandler)
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
    document.querySelectorAll('.option-item').forEach(item => {
        item.removeEventListener('click', item.clickHandler)
        item.clickHandler = null;
    })
}

const readyForNext = () => {
    QuizPageManager.readyAgainForNextQuestion();
    document.querySelector('.ready-for-next-button').disabled = true;
    document.querySelector('.waiting-for-result').children[0].textContent
            = 'Waiting for opponent response';
    document.querySelector('.waiting-for-result').children[1].textContent
            = 'Please wait for about few seconds...';
    socket.emit('ready', {
        launchUsername: localLaunchUsername,
        receiveUsername: localReceiveUsername,
        quizId: localStorage.getItem('quizId'),
    })
    currentQuestionIndex++;
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
        QuizPageManager.getResultState();
        afterReceiveResultResponsiveChange(result);
    });

    socket.on('quizFinished', ({ launchUsername, receiveUsername, quizId }) => {
        console.log("Quiz finished");
        alert("Quiz finished");
    })

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

    document.querySelector('.href-link').addEventListener('click', logout);

    document.getElementById('start-button')
            .addEventListener('click', () => {
                startQuiz(launchUsername, receiveUsername);
            })

    document.getElementById('upload-button')
            .addEventListener('click', () => uploadAnswer())

    document.getElementById('ready-for-next-button')
            .addEventListener('click', () => readyForNext())
})