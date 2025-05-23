import { socket } from './socket/index.js';

function logout() {
    localStorage.removeItem("username");
    window.location.href = "/login";
    socket.emit('disconnect');
}

function initState() {
    document.querySelector('.in-matching-part').style.display = 'none';
    // document.querySelector('.waiting-response-part').style.display = 'none';
    document.querySelector('.nobody-challenge-part').style.display = 'none';
    document.querySelector('.matching-success-part').style.display = 'none';
}

function matchingOtherState() {
    document.querySelector('.before-matching-part').style.display = 'none';
    document.querySelector('.in-matching-part').style.display = 'block';
}

function matchingOtherCancelState() {
    document.querySelector('.before-matching-part').style.display = 'block';
    document.querySelector('.in-matching-part').style.display = 'none';
}

function waitingResponseState() {
    document.querySelector('.nobody-challenge-part').style.display = 'none';
    document.querySelector('.waiting-response-part').style.display = 'block';
}

function refuseMatchingState() {
    document.querySelector('.waiting-response-part').style.display = 'none';
    document.querySelector('.nobody-challenge-part').style.display = 'block';
}

function acceptMatchingState() {
    document.querySelector('.matching-part').style.display = 'none';
    document.querySelector('.accept-part').style.display = 'none';
    document.querySelector('.matching-success-part').style.display = 'block';
}

function updateOnlinePlayers(onlinePlayers) {
    onlinePlayers = onlinePlayers.filter(player => player !== localStorage.getItem("username"));
    const matchingList = document.getElementById('matching-list');
    matchingList.innerHTML = '';

    if (onlinePlayers.length === 0) {
        const div = document.createElement('div');
        div.textContent = 'No body is online';
        div.className = 'no-player-message'
        matchingList.appendChild(div);
    }
    else {
        onlinePlayers.forEach(player => {
            const div = document.createElement('div');
            div.className = 'player-item';
            div.textContent = player;
            div.addEventListener('click', () => startMatching(player));
            matchingList.appendChild(div);
        });
    }
}

const startMatching = (targetPlayer) => {
    document.getElementById('matching-player-1').textContent = targetPlayer;
    matchingOtherState();
};

document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem("username") || "Unknown";
    document.getElementById("current-user-name").textContent = username;
    document.querySelector('.logout-button').addEventListener('click', logout);
    document.querySelector('.href-link').addEventListener('click', logout);

    initState();

    socket.emit('connected', username);

    socket.on('authSuccess', (username) => {
        console.log("Auth success:", username);
    })

    socket.on('authFailed', (username) => {
        console.log("The username has been occupied:", username);
        alert("The username has been occupied, please login again and change it");
        logout();
    })

    socket.on('onlineUserListUpdated', (onlineUserList) => {
        updateOnlinePlayers(onlineUserList);
        console.log("Online users:", onlineUserList);
    });

    document.getElementById('cancel-matching-button').addEventListener('click', () => {
        document.querySelector('.before-matching-part').style.display = 'block';
        document.querySelector('.in-matching-part').style.display = 'none';
        matchingOtherCancelState();
    });

    document.getElementById('accept-matching-button').addEventListener('click', () => {
        acceptMatchingState();
    });

    document.getElementById('refuse-matching-button').addEventListener('click', () => {
        refuseMatchingState();
    });
});
