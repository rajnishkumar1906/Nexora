// Call Socket Handler
export const setupCallSocket = (io, socket) => {
  socket.on('call_user', ({ userToCall, signalData, from, name }) => {
    io.to(userToCall).emit('incoming_call', {
      signal: signalData,
      from,
      name
    });
  });

  socket.on('answer_call', (data) => {
    io.to(data.to).emit('call_accepted', data.signal);
  });

  socket.on('end_call', ({ to }) => {
    io.to(to).emit('call_ended');
  });

  socket.on('ice_candidate', ({ to, candidate }) => {
    io.to(to).emit('ice_candidate', { candidate, from: socket.user._id });
  });

  socket.on('join_voice_channel', (channelId) => {
    socket.join(`voice:${channelId}`);
    socket.to(`voice:${channelId}`).emit('user_joined_voice', {
      userId: socket.user._id,
      username: socket.user.username
    });
  });

  socket.on('leave_voice_channel', (channelId) => {
    socket.leave(`voice:${channelId}`);
    socket.to(`voice:${channelId}`).emit('user_left_voice', {
      userId: socket.user._id
    });
  });
};
