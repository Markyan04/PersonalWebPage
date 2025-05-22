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
        console.log(`用户已连接: ${username} (总数: ${this.connectedUsers.size})`);
    }

    removeUser(socketId) {
        if (this.connectedUsers.has(socketId)) {
            const username = this.connectedUsers.get(socketId);
            this.connectedUsers.delete(socketId);
            console.log(`用户已断开: ${username} (剩余: ${this.connectedUsers.size})`);
        }
    }
}

module.exports = SocketService;
