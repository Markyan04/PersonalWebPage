import { socket } from './socket/index.js';

let currentQuestionIndex = 0;
let currentSelectionIndex = null;
let currentPlayerTotalScore = '0';
let currentOpponentTotalScore = '0';
let pointForThisQuestion = 'Unknown';
const totalQuestions = 10;
const onCompetitionText = "On competition and waiting for result.";
const winAndGetPoint = "You are correct and faster than your opponent.";
const wrongAndNoPoint = "You are faster but you are wrong.";
const slowAndNoPoint = "Your opponent is faster and he is correct.";
const slowAndGetPoint = "Your opponent is faster but he is wrong.";

const readyPageInit = () => {
    document.querySelector('.test-part').style.display = 'none';
    document.querySelector('.ready-part').style.display = 'block';
    document.querySelector('.ready-text-after').style.display = 'none';
    document.querySelector('.ready-text-before').style.display = 'block';
    document.querySelector('.start-button').classList.add('start-button-before');
    document.querySelector('.start-button').classList.remove('start-button-after');
}

const readyButtonClick = () => {
    document.querySelector('.test-part').style.display = 'none';
    document.querySelector('.ready-part').style.display = 'block';
    document.querySelector('.ready-text-after').style.display = 'block';
    document.querySelector('.ready-text-before').style.display = 'none';
    document.querySelector('.start-button').classList.add('start-button-after');
    document.querySelector('.start-button').classList.remove('start-button-before');
}

const enterTestPage = () => {
    document.querySelector('.test-part').style.display = 'block';
    document.querySelector('.ready-part').style.display = 'none';
}

const beforeAnswerState = () => {
    document.querySelector('.option-item').classList.remove('option-item-selected');
    document.querySelector('.ready-for-next-button').style.display = 'none';
    document.querySelector('.upload-button').style.display = 'block';
    document.querySelector('.waiting-for-result').style.display = 'none';
    document.querySelector('.progress-bar').style.width = `${(currentQuestionIndex + 1 / totalQuestions) * 100}%`;
    document.querySelector('.progress-text').textContent = `${currentQuestionIndex + 1}/${totalQuestions}`;
    document.querySelector('.result-text').textContent = onCompetitionText;
    document.querySelector('.result-text').classList.add('result-late');
    document.getElementById('current-score').textContent = pointForThisQuestion;
    document.getElementById('total-score').textContent = currentPlayerTotalScore;
    document.getElementById('opponent-total-score').textContent = currentOpponentTotalScore;
}

const uploadAnswerButNoResultState = () => {
    document.querySelector('.upload-button').style.display = 'none';
    document.querySelector('.waiting-for-result').style.display = 'block';
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
    readyButtonClick();
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
    socket.emit('uploadAnswer', {
        answer: currentSelectionIndex,
        quizId: localStorage.getItem('quizId'),
    })
}

const registerQuizEvents = () => {
    socket.on('waitingForPartner', ({ launchUsername, receiveUsername }) => {
        console.log("Waiting for partner");
    });

    socket.on('question', ({ launchUsername, receiveUsername, questionInfo, quizId }) => {
        console.log("Question received");
        localStorage.setItem('quizId', quizId);
        enterTestPage();
        renderQuestion(questionInfo);
        beforeAnswerState();
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
    readyPageInit();
    socket.emit('quizConnected');
    registerQuizEvents();

    const { launchUsername, receiveUsername } = getUrlParams();

    document.getElementById('start-button')
            .addEventListener('click', () => {
                startQuiz(launchUsername, receiveUsername);
            })

    document.getElementById('upload-button')
            .addEventListener('click', () => uploadAnswer())
})