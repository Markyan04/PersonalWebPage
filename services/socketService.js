import UserList from "../data/userList.js";

class SocketService {
    static instance = null;

    constructor() {
        this.userList = UserList.getInstance();
    }

    static getInstance() {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }

    addUser(socketId, username) {
        if (this.userList.getConnectedUserSocketIdsWithName().some(u => u.username === username)) {
            return {
                success: false,
                message: 'Username already exists'
            };
        }
        this.userList.addUser(socketId, username);
        console.log(`User has connected: ${username} (Total: ${this.userList.getConnectedUsers().length})`);
        return {
            success: true,
            message: 'User added successfully'
        };
    }

    removeUser(socketId) {
        if (this.userList.getConnectedUserSocketIdsWithName().some(u => u.socketId === socketId)) {
            const username = this.userList.getConnectedUserSocketIdsWithName()
                    .find(u => u.socketId === socketId).username;
            this.userList.removeUser(socketId);
            console.log(`User has disconnected: ${username} (Remainder: ${this.userList.getConnectedUsers().length})`);
            return {
                success: true,
                message: 'User removed successfully'
            }
        }
        return {
            success: false,
            message: 'User not found'
        }
    }

    getOnlineUsers() {
        return this.userList.getConnectedUsers();
    }
}

export default SocketService;
