import { io } from "https://cdn.socket.io/4.7.2/socket.io.esm.min.js";

const socket = io();

socket.on('connect', () => {
    console.log('Connected to server with ID:', socket.id);
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});

export { socket };