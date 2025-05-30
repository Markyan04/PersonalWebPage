import { Server } from 'socket.io';
import SocketController from './controllers/socketController.js';

let io;

export function init(server) {
    io = new Server(server);

    const controller = new SocketController(io);

    io.on('connection', (socket) => {
        // Prevent duplicate connections
        if (socket.recovered) {
            console.log(`Connection recovered: ${socket.id}`);
            return;
        }

        controller.handleConnection(socket);
    });
}