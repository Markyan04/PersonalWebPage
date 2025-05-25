import {socket} from './socket/index.js';
import {PageManager} from "./utils/page.js";
import Timer from "./utils/timer.js";

let localStorageOnlinePlayers = [];
let localStorageChallengers = [];

const logout = () => {
    localStorage.removeItem("username");
    socket.emit('logout');
    window.location.href = "/login";
}

const startMatching = (targetPlayer) => {
    const currentUser = localStorage.getItem('username');
    document.getElementById('matching-player-1').textContent = targetPlayer;
    socket.emit('applyInitPhase1', {
        launchUsername: currentUser,
        receiveUsername: targetPlayer
    });
    PageManager.showMatchingPart();
};

const acceptMatching = (challenger) => {
    socket.emit('applyAcceptPhase1', {
        launchUsername: challenger,
        receiveUsername: localStorage.getItem('username')
    });

    // Once one is accepted, all other challengers will be automatically rejected.
    let autoRejectChallengers = localStorageChallengers.filter(player => player !== challenger);
    autoRejectChallengers.forEach((player) => {
        socket.emit('applyRefusePhase1', {
            launchUsername: player,
            receiveUsername: localStorage.getItem('username')
        });
    })

    matchingSuccess(challenger, localStorage.getItem('username'));
}

const refuseMatching = (challenger) => {
    socket.emit('applyRefusePhase1', {
        launchUsername: challenger,
        receiveUsername: localStorage.getItem('username')
    });

    deleteChallenger(challenger);
    PageManager.showMatchingList();
}

const addChallenger = (challenger) => {
    localStorageChallengers.push(challenger);
    renderChallengers();
}

const deleteChallenger = (challenger) => {
    localStorageChallengers.pop(challenger);
    renderChallengers();
}

const renderChallengers = () => {
    const matchingWaitingList = document.querySelector('.matching-waiting-list');
    matchingWaitingList.innerHTML = '';
    if (localStorageChallengers.length === 0) {
        PageManager.showNobodyWaiting();
    }
    else {
        PageManager.showWaitingResponse();
        localStorageChallengers.forEach((challenger, index) => {
            const waitingItem = document.createElement('div');
            waitingItem.className = 'waiting-item';
            const waitingInfo = document.createElement('span');
            waitingInfo.className = 'waiting-info';
            waitingInfo.textContent = challenger;
            const waitingButtons = document.createElement('div');
            waitingButtons.className = 'waiting-buttons';

            const acceptButton = document.createElement('button');
            acceptButton.className = 'accept-matching-button';
            acceptButton.textContent = 'Accept';
            acceptButton.id = 'accept-matching-button' + index;
            acceptButton.addEventListener('click', () => acceptMatching(challenger))

            const refuseButton = document.createElement('button');
            refuseButton.className = 'refuse-matching-button';
            refuseButton.textContent = 'Refuse';
            refuseButton.id = 'refuse-matching-button' + index;
            refuseButton.addEventListener('click', () => refuseMatching(challenger))

            waitingButtons.appendChild(acceptButton);
            waitingButtons.appendChild(refuseButton);
            waitingItem.appendChild(waitingInfo);
            waitingItem.appendChild(waitingButtons);
            document.querySelector('.matching-waiting-list').appendChild(waitingItem);
        })
    }
}

const updateOnlinePlayers = (onlinePlayers) => {
    localStorageOnlinePlayers = onlinePlayers.filter(player => player !== localStorage.getItem("username"));
    const matchingList = document.getElementById('matching-list');
    matchingList.innerHTML = '';

    if (localStorageOnlinePlayers.length === 0) {
        const div = document.createElement('div');
        div.textContent = 'No body is online';
        div.className = 'no-player-message'
        matchingList.appendChild(div);
    }
    else {
        localStorageOnlinePlayers.forEach(player => {
            const div = document.createElement('div');
            div.className = 'player-item';
            div.textContent = player.toString();
            div.addEventListener('click', () => startMatching(player));
            matchingList.appendChild(div);
        });
    }
}

const matchingSuccess = (launchUsername, receiveUsername) => {
    PageManager.showMatchingSuccess();
    const countdownElement = document.getElementById('matching-countdown');
    const redirectTimer = new Timer(5, () => {
        window.location.href = "/quiz?launchUsername=" + launchUsername + "&receiveUsername=" + receiveUsername;
    });
    redirectTimer.onUpdate = (remaining) => {
        countdownElement.textContent = remaining;
    };
    redirectTimer.reset();
    redirectTimer.start();
}

const registerMatchingEvents = () => {
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

    socket.on('applyInitPhase2', ({ launchUsername, receiveUsername }) => {
        addChallenger(launchUsername);
    });

    socket.on('applyCancelPhase2', ({launchUsername, receiveUsername}) => {
        deleteChallenger(launchUsername);
    });

    socket.on('applyAcceptPhase2', ({ launchUsername, receiveUsername }) => {
        matchingSuccess(launchUsername, receiveUsername);
    });

    socket.on('applyRefusePhase2', ({ launchUsername, receiveUsername }) => {
        confirm(`The player ${launchUsername} refused your matching request`);
        PageManager.showMatchingList();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("current-user-name").textContent = localStorage.getItem('username');
    document.querySelector('.logout-button').addEventListener('click', logout);
    document.querySelector('.href-link').addEventListener('click', logout);

    PageManager.initState();
    socket.emit('firstConnected');

    registerMatchingEvents();

    document.getElementById('cancel-matching-button').addEventListener('click', () => {
        socket.emit('applyCancelPhase1', {
            launchUsername: localStorage.getItem('username'),
            receiveUsername: document.getElementById('matching-player-1').textContent
        });
        PageManager.showMatchingList();
    });
});