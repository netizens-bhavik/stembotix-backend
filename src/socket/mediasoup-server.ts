import { Server } from 'socket.io';
import groupChat from './group-chat';
import videoBroadcast from './video-broadcast';

function mediaSoupServer(io: Server) {
  // videoBroadcast(io);
  groupChat(io);
}
export default mediaSoupServer;
