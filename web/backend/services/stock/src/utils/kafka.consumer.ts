import { Kafka } from 'kafkajs';
import { Server as SocketIOServer } from 'socket.io';
import { redisClient } from './cache_with_revalidation';
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
  
  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        // console.log('📥 Received message:', message);
          const value = message.value?.toString();
          if (!value) return;
          
          const parsed: StockMessage = JSON.parse(value);
          const { symbol , data } = parsed;
          const timestamp = new Date(data.timestamp || Date.now()).getTime();
          const key = `live:${symbol.toUpperCase().trim()}`; // e.g., live:AAPL

          await redisClient.zadd(key, timestamp, JSON.stringify(data));

          // Set TTL for the key (optional: 24h only once)
          await redisClient.expire(key, 86400); // 24 hours
          // console.log(`📈 Processing stock update for ${symbol}`);
          // console.log(typeof symbol, symbol);
        io.to(symbol.trim()).emit('stock-update', { symbol, data });
        
      } catch (err) {
        console.error('❌ Failed to process message:', err);
      }
    }
  });

  console.log("✅ Kafka consumer is listening...");
};
