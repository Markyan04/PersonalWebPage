import { socket } from './socket/index.js';
import { HallPageManager } from "./utils/page.js";
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
    HallPageManager.showMatchingPart();
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
    HallPageManager.showMatchingList();
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
        HallPageManager.showNobodyWaiting();
    }
    else {
        HallPageManager.showWaitingResponse();
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
    HallPageManager.showMatchingSuccess();
    const countdownElement = document.getElementById('matching-countdown');
    const redirectTimer = new Timer(3, () => {
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
                    <p style="
                        color: #6c757d;
                        line-height: 1.6;
                        margin-bottom: 1.5rem;
                    ">
                        The username is already taken
                    </p>
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
        HallPageManager.showMatchingList();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    HallPageManager.initState();
    document.getElementById("current-user-name").textContent = localStorage.getItem('username');
    document.querySelector('.logout-button').addEventListener('click', logout);
    document.querySelector('.href-link').addEventListener('click', logout);

    socket.emit('firstConnected');
    registerMatchingEvents();

    document.getElementById('cancel-matching-button').addEventListener('click', () => {
        socket.emit('applyCancelPhase1', {
            launchUsername: localStorage.getItem('username'),
            receiveUsername: document.getElementById('matching-player-1').textContent
        });
        HallPageManager.showMatchingList();
    });
});