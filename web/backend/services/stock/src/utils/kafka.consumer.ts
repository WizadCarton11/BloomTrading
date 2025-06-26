import { Kafka } from 'kafkajs';
import { Server as SocketIOServer } from 'socket.io';

interface StockMessage {
  symbol: string;
  data: any;
}

export const createKafkaConsumer = async (io: SocketIOServer) => {
  const kafka = new Kafka({
    clientId: 'stock-consumer',
    brokers: ['localhost:9092'], // same as KAFKA_URI
  });

  const consumer = kafka.consumer({ groupId: 'stock-group' });

  await consumer.connect();
  await consumer.subscribe({ topic: 'live_stock_data', fromBeginning: false });
  let i=0
  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
          const value = message.value?.toString();
          if (!value) return;
          
          const parsed: StockMessage = JSON.parse(value);
          const { symbol, data } = parsed;
            //   if (i%10 === 0) {
            //     console.log(`📈 Processing stock update for ${symbol}:`, data);
            //   };
        // console.log(`📈 Received stock update for ${symbol}:`, data);
        // Push to WebSocket room for the symbol
        io.to(symbol).emit('stock-update', { symbol, data });
        i++;
        
      } catch (err) {
        console.error('❌ Failed to process message:', err);
      }
    }
  });

  console.log("✅ Kafka consumer is listening...");
};
