import chatSocket from './chat.socket.js';
import channelSocket from './channel.socket.js';
import gameSocket from './game.socket.js';

export const initialize = (io) => {
  chatSocket(io);
  channelSocket(io);
  gameSocket(io);
  console.log('Real-time service initialized');
};

export default {
  initialize,
  name: 'real-time-service',
};
