// Channel Socket
export default (io) => {
  io.on('connection', (socket) => {
    console.log('Channel socket connected:', socket.id);

    socket.on('joinChannel', (channelId) => {
      socket.join(`channel_${channelId}`);
    });

    socket.on('sendChannelMessage', (data) => {
      io.to(`channel_${data.channelId}`).emit('receiveChannelMessage', data);
    });

    socket.on('disconnect', () => {
      console.log('Channel socket disconnected:', socket.id);
    });
  });
};
