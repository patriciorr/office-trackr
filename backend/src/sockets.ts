import {Server} from 'socket.io';

let io: Server | null = null;

export function initSocket(server: any) {
  io = new Server(server, {
    cors: {origin: '*'},
  });
  io.on('connection', socket => {
    // Add authentication logic here
  });
}

export function emitEventUpdate(userId: string) {
  if (io) {
    io.emit(`event-update-${userId}`);
  }
}
