import { io } from "https://cdn.socket.io/4.7.2/socket.io.esm.min.js";

const socket = io({
    reconnection: false,
    auth: {
        username: localStorage.getItem('username')
    }
});

socket.on('connect', () => {
    console.log('Connected to server with ID:', socket.id);
});

socket.on('connect_error', (error) => {
    console.log('Connection error:', error);
    alert('Connection failed. Please try again.');
    window.location.href = '/login';
});

socket.on('reconnect', (attemptNumber) => {
    console.log('Reconnected after', attemptNumber, 'attempts');
});

socket.on('reconnect_failed', () => {
    console.log('Failed to reconnect');
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});

export { socket };
