import { Server } from 'socket.io';
import { FastifyInstance } from 'fastify';

export const setupWebSocket = (fastify: FastifyInstance): Server => {
  const io = new Server(fastify.server, {
    cors: { origin: "*" },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    socket.on('subscribe', (symbol: string) => {
      socket.join(symbol);
      console.log(`📥 ${socket.id} subscribed to ${symbol}`);
    });

    socket.on('unsubscribe', (symbol: string) => {
      socket.leave(symbol);
      console.log(`📤 ${socket.id} unsubscribed from ${symbol}`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  return io;
};
