module.exports = function setupSocket(io) {
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    console.log(`Kullanıcı bağlandı: ${socket.id}`);

    socket.on('user:online', (userId) => {
      onlineUsers.set(userId, socket.id);
      socket.broadcast.emit('user:online', { userId, timestamp: new Date() });
    });

    socket.on('message:new', (message) => {
      socket.broadcast.emit('message:receive', message);
    });

    socket.on('message:read', (messageId) => {
      socket.broadcast.emit('message:read', { messageId });
    });

    socket.on('inventory:updated', (data) => {
      socket.broadcast.emit('inventory:updated', data);
    });

    socket.on('disconnect', () => {
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          socket.broadcast.emit('user:offline', { userId });
          break;
        }
      }
    });
  });
};
