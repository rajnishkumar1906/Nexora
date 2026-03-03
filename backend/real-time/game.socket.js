// Game Socket
export default (io) => {
  io.on('connection', (socket) => {
    console.log('Game socket connected:', socket.id);

    socket.on('joinGame', (gameId) => {
      socket.join(`game_${gameId}`);
    });

    socket.on('gameMove', (data) => {
      io.to(`game_${data.gameId}`).emit('gameUpdated', data);
    });

    socket.on('disconnect', () => {
      console.log('Game socket disconnected:', socket.id);
    });
  });
};
