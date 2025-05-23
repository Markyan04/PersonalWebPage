import MatchingService from '../services/matchingService.js';

export default class MatchingController {
  constructor(io) {
    this.io = io;
    this.matchingService = MatchingService.getInstance();
  }

  registerEvents(socket) {
    socket.on('applyInitPhase1', ({ launchUsername, receiveUsername }) => {
      console.log(`Received applyInitPhase1 event from ${launchUsername} to ${receiveUsername}`);
      const result = this.matchingService.validUserAndGetConnectionId(launchUsername, receiveUsername);
      if (result.valid) {
        this.io.to(result.receiveSocketId).emit('applyInitPhase2', { 
          launchUsername,
          receiveUsername
        });
      }
    });

    socket.on('applyCancelPhase1', ({ launchUsername, receiveUsername }) => {
      console.log(`Received applyCancelPhase1 event from ${launchUsername} to ${receiveUsername}`);
      const result = this.matchingService.validUserAndGetConnectionId(launchUsername, receiveUsername);
      if (result.valid) {
        this.io.to(result.receiveSocketId).emit('applyCancelPhase2', {
          launchUsername,
          receiveUsername
        });
      }
    });

    socket.on('applyAcceptPhase1', ({ launchUsername, receiveUsername }) => {
      console.log(`Received applyAcceptPhase1 event from ${launchUsername} to ${receiveUsername}`);
      const result = this.matchingService.createCompetition(launchUsername, receiveUsername);
      if (result.valid) {
        this.io.to(result.launchSocketId).emit('applyAcceptPhase2', {
          launchUsername,
          receiveUsername
        });
      }
    });

    socket.on('applyRefusePhase1', ({ launchUsername, receiveUsername }) => {
      console.log(`Received applyRefusePhase1 event from ${launchUsername} to ${receiveUsername}`);
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
