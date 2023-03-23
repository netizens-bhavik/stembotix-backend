import LiveStreamChatService from '@/services/liveStreamChat.service';
import LiveStreamChatServiceLogs from '@/services/livestreamchatlogs.service';
import { Server } from 'socket.io';
const liveStreamchatlogsService = new LiveStreamChatServiceLogs();
const liveStreamchatService = new LiveStreamChatService();

function groupChat(io: Server) {
  io.on('connection', (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);
    socket.on('get-data', (data) => console.log('data', data));
    socket.on('join', async (data) => {
      // console.log('🔥: A user joined', data);
      try {
        if (data.roomId && data.userId) {
          // console.log('🔥: A user joined', data);
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

          io.emit(
            'messageResponse',
            await liveStreamchatService.getLiveStreamChatMsg(data.roomId)
          );
        }
      } catch (err) {
        io.emit('errMessage', { message: err.message, type: 'error' });
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

        io.emit(
          'messageResponse',
          await liveStreamchatService.getLiveStreamChatMsg(data.livestreamId)
        );
      } catch (err) {
        io.emit('errMessage', { message: err.message, type: 'error' });
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
  });
  const fetchActiveLiveStreamUsers = async (livestreamId) => {
    try {
      const dataresponce =
        await liveStreamchatlogsService.fetchActiveLiveStreamUsers(
          livestreamId
        );
      return dataresponce;
    } catch (err) {
      // console.log('fetchActiveLiveStreamUsers', err.message);
    }
  };
}
export default groupChat;
