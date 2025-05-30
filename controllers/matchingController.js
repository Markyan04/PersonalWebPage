import MatchingService from '../services/matchingService.js';
import SocketService from "../services/socketService.js";

export default class MatchingController {
    constructor(io) {
        this.io = io;
        this.matchingService = MatchingService.getInstance();
        this.socketService = SocketService.getInstance();
    }

    registerEvents(socket) {
        socket.on('applyInitPhase1', ({ launchUsername, receiveUsername }) => {
            console.log(`Received applyInitPhase1 event. 
                Competition Launcher: ${launchUsername}, Competition Receiver ${receiveUsername}`);
            const result = this.matchingService.validUserAndGetConnectionId(launchUsername, receiveUsername);
            if (result.valid) {
                this.io.to(result.receiveSocketId).emit('applyInitPhase2', {
                    launchUsername,
                    receiveUsername
                });
            }
        });

        socket.on('applyCancelPhase1', ({ launchUsername, receiveUsername }) => {
            console.log(`Received applyCancelPhase1 event. 
                Competition Launcher: ${launchUsername}, Competition Receiver ${receiveUsername}`);
            const result = this.matchingService.validUserAndGetConnectionId(launchUsername, receiveUsername);
            if (result.valid) {
                this.io.to(result.receiveSocketId).emit('applyCancelPhase2', {
                    launchUsername,
                    receiveUsername
                });
            }
        });

        socket.on('applyAcceptPhase1', ({ launchUsername, receiveUsername }) => {
            console.log(`Received applyAcceptPhase1 event. 
                Competition Launcher: ${launchUsername}, Competition Receiver ${receiveUsername}`);
            const result = this.matchingService.createCompetition(launchUsername, receiveUsername);
            if (result.valid) {
                this.io.to(result.launchSocketId).emit('applyAcceptPhase2', {
                    launchUsername,
                    receiveUsername
                });
            }
            this.io.emit('onlineUserListUpdated', this.socketService.getOnlineUsers());
        });

        socket.on('applyRefusePhase1', ({ launchUsername, receiveUsername }) => {
            console.log(`Received applyRefusePhase1 event. 
                Competition Launcher: ${launchUsername}, Competition Receiver ${receiveUsername}`);
            const result = this.matchingService.validUserAndGetConnectionId(launchUsername, receiveUsername);
            if (result.valid) {
                this.io.to(result.launchSocketId).emit('applyRefusePhase2', {
                    launchUsername,
                    receiveUsername
                });
            }
        });
    }
}
