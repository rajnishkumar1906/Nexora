// Chat Socket
export default (io) => {
  io.on('connection', (socket) => {
    console.log('Chat socket connected:', socket.id);

    socket.on('joinChat', (chatId) => {
      socket.join(chatId);
    });

    socket.on('sendMessage', (data) => {
      io.to(data.chatId).emit('receiveMessage', data);
    });

    socket.on('disconnect', () => {
      console.log('Chat socket disconnected:', socket.id);
    });
  });
};
