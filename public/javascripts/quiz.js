import { socket } from './socket/index.js';
import LoadingManager from "./utils/loading.js";

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

const renderQuestion = (questionInfo) => {
    document.getElementById('question-text').textContent = questionInfo.question;
    questionInfo.options.forEach((option, index) => {
        document.getElementById(`option-item-${index + 1}`).textContent = option;
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

const registerQuizEvents = () => {
    socket.on('waitingForPartner', ({ launchUsername, receiveUsername }) => {
        console.log("Waiting for partner");
    });

    socket.on('question', ({ launchUsername, receiveUsername, questionInfo, quizId }) => {
        console.log("Question received");
        localStorage.setItem('quizId', quizId);
        enterTestPage();
        renderQuestion(questionInfo);
    })

    socket.on('authSuccess', (username) => {
        LoadingManager.hide();
        console.log("Auth success:", username);
    })

    socket.on('authFailed', (username) => {
        LoadingManager.hide();
        console.log("The username has been occupied:", username);
        alert("Failed to connect to the server");
    })
}

document.addEventListener('DOMContentLoaded', () => {
    readyPageInit();
    socket.emit('quizConnected');
    LoadingManager.show();
    registerQuizEvents();

    const { launchUsername, receiveUsername } = getUrlParams();

    document.getElementById('start-button').addEventListener('click', () => {
        startQuiz(launchUsername, receiveUsername);
    })
})