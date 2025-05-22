import { io } from "https://cdn.socket.io/4.7.2/socket.io.esm.min.js";

function logout() {
    localStorage.removeItem("username");
    window.location.href = "/login";
}

document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem("username") || "Unknown";
    document.getElementById("current-user-name").textContent = username;

    document.querySelector('.logout-button').addEventListener('click', logout);

    const socket = io();
    socket.emit('connected', username);

    socket.on('disconnect', () => {
        console.log('Disconnected from server');
        alert("You have been disconnected from the server.");
    })

})

