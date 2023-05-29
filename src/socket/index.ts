import { Server } from 'socket.io';
import type { Server as httpServer } from 'http';
import LiveStreamChatServiceLogs from '@/services/livestreamchatlogs.service';
import LiveStreamChatService from '@/services/liveStreamChat.service';

const liveStreamchatlogsService = new LiveStreamChatServiceLogs();
const liveStreamchatService = new LiveStreamChatService();

let users = [];
const initEvents = (io: Server) => {
  io.on('connection', (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);
    socket.on('get-data', (data) => console.log('data', data));
    socket.on('join', async (data) => {
      console.log('🔥: A user joined', data);
      try {
        if (data.roomId && data.userId) {
          // console.log('🔥: A user joined', data);
          await liveStreamchatlogsService.newUserJoined({
            livestreamId: data.roomId,
            userId: data.userId,
            socketId: socket.id,
          });

          socket.join(data.roomId);

          io.to(data.roomId).emit(
            'latestActiveUsers',
            await fetchActiveLiveStreamUsers(data.roomId)
          );

          io.to(data.roomId).emit(
            'messageResponse',
            await liveStreamchatService.getLiveStreamChatMsg(data.roomId)
          );
        }
      } catch (err) {
        io.to(data.roomId).emit('errMessage', {
          message: err.message,
          type: 'error',
        });
        // console.log('join', err.message);
      }
    });
    socket.on('message', async (data) => {
      try {
        await liveStreamchatService.sendLiveStreamChat(
          data.livestreamId,
          data.message,
          data.loggedUser
        );

        io.to(data.livestreamId).emit(
          'messageResponse',
          await liveStreamchatService.getLiveStreamChatMsg(data.livestreamId)
        );
      } catch (err) {
        io.to(data.livestreamId).emit('errMessage', {
          message: err.message,
          type: 'error',
        });
        // console.log('join', err.message);
      }
    });
    socket.on('typing', (data) => {
      socket.broadcast.emit('typingResponse', data);
    });
    socket.on('stop typing', (data) => {
      socket.broadcast.emit('stop typing', data);
    });
    socket.on('newUser', async (data) => {
      // users.push(data);
      // await liveStreamchatlogsService.newUserJoined({
      //   ...data,
      //   socketId: socket.id,
      // });
      // if (data.roomId && data.userId) {
      //   await liveStreamchatlogsService.newUserJoined({
      //     livestreamId: data.roomId,
      //     userId: data.userId,
      //     socketId: socket.id,
      //   });
      //   io.emit(
      //     'latestActiveUsers',
      //     await fetchActiveLiveStreamUsers(data.livestreamId)
      //   );
      // }
    });
    // change user status to offline when user disconnect
    socket.on('disconnect', async () => {
      console.log('🔥: A user disconnected');
      const livestreamId = await liveStreamchatlogsService.userDisconnected({
        socketId: socket.id,
      });
      console.log();
      if (livestreamId) {
        io.to(livestreamId).emit(
          'latestActiveUsers',
          await fetchActiveLiveStreamUsers(livestreamId)
        );
      }
    });
  });
};

const fetchActiveLiveStreamUsers = async (livestreamId) => {
  try {
    const dataresponce =
      await liveStreamchatlogsService.fetchActiveLiveStreamUsers(livestreamId);
    return dataresponce;
  } catch (err) {
    // console.log('fetchActiveLiveStreamUsers', err.message);
  }
};

const init = (server: httpServer) => {
  const io = new Server(server, {
    maxHttpBufferSize: 10e6,
    pingTimeout: 30000,
    transports: ['websocket','polling'],
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
