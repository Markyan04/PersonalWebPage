import UserList from "../model/userList.js";

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

    queryUser(username, socketId) {
        if (this.userList.getConnectedUserSocketIdsWithName().some(u => u.username === username)) {
            return {
                success: false,
                message: 'Username already exists'
            };
        }
        else {
            return {
                success: true,
                message: 'Username available'
            };
        }
    }

    addOrUpdateUser(socketId, username) {
        this.userList.addUser(socketId, username);
        if (this.userList.getOnCompetitionUserSocketIdsWithName().some(u => u.username === username)) {
            this.userList.addOnCompetitionUser(socketId, username);
        }
        console.log(`User has connected: ${username}, ${socketId} (Total: ${this.userList.getConnectedUsers().length})`);
        return {
            success: true,
            message: 'User added successfully'
        };
    }

    removeUser(socketId, username) {
        if (this.userList.getConnectedUserSocketIdsWithName().some(u => u.username === username)) {
            this.userList.removeUser(socketId, username);
            console.log(`User has disconnected: ${username}, ${socketId} (Remainder: ${this.userList.getConnectedUsers().length})`);
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
        return this.userList.getOnlineUsers();
    }

    getSocketIdByUsername(username) {
        return this.userList.getSocketIdByUsername(username);
    }
}

export default SocketService;
