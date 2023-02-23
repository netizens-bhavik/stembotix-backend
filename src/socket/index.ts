import { Server } from 'socket.io';
import type { Server as httpServer } from 'http';
import LiveStreamChatServiceLogs from '@/services/livestreamchatlogs.service';
import LiveStreamChatService from '@/services/liveStreamChat.service';

const liveStreamchatlogsService = new LiveStreamChatServiceLogs();
const liveStreamchatService = new LiveStreamChatService();

let users = [];
const initEvents = (io: Server) => {
  io.on('connection', (socket) => {
    console.log(`⚡: user just connected!`);
    // */${socket.id}
    socket.on('get-data', (data) => console.log('data', data));
    socket.on('join', async (data) => {
      console.log('🔥: A user joined', data);
      try {
        if (data.roomId && data.userId) {
          console.log('in if');
          await liveStreamchatlogsService.newUserJoined({
            livestreamId: data.roomId,
            userId: data.userId,
            socketId: socket.id,
          });

          socket.join(data.roomId);

          io.emit(
            'latestActiveUsers',
            await fetchActiveLiveStreamUsers(data.roomId)
          );
        } else {
          console.log('something went wrong');
        }
      } catch (err) {
        console.log(err);
      }
    });
    socket.on('message', async (data) => {
      try {
        // await liveStreamchatService.sendLiveStreamChat(
        //   data.livestreamId,
        //   data.message,
        //   data.loggedUser
        // );
        io.emit('messageResponse', data);
      } catch (err) {
        console.log(err);
      }
    });
    socket.on('typing', (data) =>
      socket.broadcast.emit('typingResponse', data)
    );
    socket.on('newUser', async (data) => {
      // users.push(data);
      // await liveStreamchatlogsService.newUserJoined({
      //   ...data,
      //   socketId: socket.id,
      // });
      // io.emit(
      //   'latestActiveUsers',
      //   await fetchActiveLiveStreamUsers(data.livestreamId)
      // );
    });

    // change user status to offline when user disconnect
    socket.on('disconnect', async () => {
      console.log('🔥: A user disconnected');
      await liveStreamchatlogsService.userDisconnected({ socketId: socket.id });
    });
  });
};

const fetchActiveLiveStreamUsers = async (livestreamId) => {
  try {
    const dataresponce =
      await liveStreamchatlogsService.fetchActiveLiveStreamUsers(livestreamId);
    return dataresponce;
  } catch (err) {
    console.log(err);
  }
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
