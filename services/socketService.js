class SocketService {
    static instance = null;
    connectedUsers = new Map();

    static getInstance() {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }

    addUser(socketId, username) {
        this.connectedUsers.set(socketId, username);
        console.log(`User has connected: ${username} (Total: ${this.connectedUsers.size})`);
    }

    removeUser(socketId) {
        if (this.connectedUsers.has(socketId)) {
            const username = this.connectedUsers.get(socketId);
            this.connectedUsers.delete(socketId);
            console.log(`User has disconnected: ${username} (Remainder: ${this.connectedUsers.size})`);
        }
    }
}

module.exports = SocketService;
