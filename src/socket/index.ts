import { Server } from 'socket.io';
import type { Server as httpServer } from 'http';

let users = [];
const initEvents = (io: Server) => {
  io.on('connection', (socket) => {
    console.log(`⚡: user just connected!`);
    // */${socket.id}
    socket.on('get-data', (data) => console.log('data', data));

    socket.on('message', (data) => {
      io.emit('messageResponse', data);
    });
    socket.on('typing', (data) =>
      socket.broadcast.emit('typingResponse', data)
    );
    socket.on('newUser', (data) => {
      users.push(data);
      io.emit('newUserResponse', users);
    });

    socket.on('disconnect', () => {
      console.log('🔥: A user disconnected');
    });
  });
};

const init = (server: httpServer) => {
  const io = new Server(server, {
    maxHttpBufferSize: 1e8,
    pingTimeout: 60000,
    cors: {
      origin: '*',
      credentials: true,
      methods: ['GET', 'POST'],
    },
  });
  initEvents(io);
  return io;
};

export default init;
