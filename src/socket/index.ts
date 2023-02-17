import { Server } from 'socket.io';
import type { Server as httpServer } from 'http';

const initEvents = (io: Server) => {
  io.on('connection', (socket) => {
    console.log(`⚡: user just connected!`);
    // */${socket.id}
    socket.on('get-data', (data) => console.log('data', data));

    socket.on('disconnect', () => {
      console.log('🔥: A user disconnected');
    });
  });
};

const init = (server: httpServer) => {
  const io = new Server(server, {
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
