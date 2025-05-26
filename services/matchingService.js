import UserList from '../model/userList.js';

class MatchingService {
    static instance = null;

    constructor() {
        this.userList = UserList.getInstance();
    }

    static getInstance() {
        if (!MatchingService.instance) {
            MatchingService.instance = new MatchingService();
        }
        return MatchingService.instance;
    }

    validUserAndGetConnectionId(launchUsername, receiveUsername) {
        const launchUser = this.userList.getConnectedUserSocketIdsWithName()
                .find(u => u.username === launchUsername);
        const receiveUser = this.userList.getConnectedUserSocketIdsWithName()
                .find(u => u.username === receiveUsername);

        if (!launchUser || !receiveUser) {
            return {
                valid: false,
                message: 'The user is not online.'
            };
        }

        return {
            valid: true,
            launchSocketId: launchUser.socketId,
            receiveSocketId: receiveUser.socketId
        };
    }

    createCompetition(launchUsername, receiveUsername) {
        const launchUser = this.userList.getConnectedUserSocketIdsWithName()
                .find(u => u.username === launchUsername);
        const receiveUser = this.userList.getConnectedUserSocketIdsWithName()
                .find(u => u.username === receiveUsername);

        if (!launchUser || !receiveUser) {
            return {
                valid: false,
                message: 'The user is not online.'
            };
        }

        this.userList.addOnCompetitionUser(launchUser.socketId, launchUsername);
        this.userList.addOnCompetitionUser(receiveUser.socketId, receiveUsername);

        return {
            valid: true,
            launchSocketId: launchUser.socketId,
            receiveSocketId: receiveUser.socketId
        };
    }
}

export default MatchingService;
