import { EachMessagePayload, Kafka } from 'kafkajs';
import { Server as SocketIOServer } from 'socket.io';
import { redisClient } from './cache_with_revalidation';
import { addToPortfolio } from '../services/stock.service';
interface StockMessage {
  symbol: string;
  data: any;
}
// {"event":"transaction_created","data":{"transactionId":"818003dc-a10d-4ec4-8e23-c93845cf1f6c","userId":"32ce761a-e0ad-436f-9b46-6bbe7bed7c17","stockSymbol":"AAPL","amount":"200","numberOfShares":20,"averagePrice":0}}

interface TransactionMessage {
  event: string;
  data: {
    transactionId: string;
    userId: string;
    stockSymbol: string;
    amount: string;
    numberOfShares: number;
    averagePrice: number;
  };  
}

export const createKafkaConsumer = async (io: SocketIOServer) => {
  const kafka = new Kafka({
    clientId: 'stock-consumer',
    // user environment variable for brokers
    brokers: [ process.env.KAFKA_BROKER || 'localhost:9092' ] // Replace with your broker addresses
  });

  const consumer = kafka.consumer({ groupId: 'stock-group' });

  await consumer.connect();
  await consumer.subscribe({ topic: 'live_stock_data', fromBeginning: false });
  await consumer.subscribe({ topic: 'transactions', fromBeginning: false });
  
    await consumer.run({
    eachMessage: async ({ topic, message }: EachMessagePayload) => {
      try {
        const value = message.value?.toString();
        if (!value) return;

        if (topic === 'live_stock_data') {
          const parsed: StockMessage = JSON.parse(value);
          const { symbol, data } = parsed;
          const timestamp = new Date(data.timestamp || Date.now()).getTime();
          const key = `live:${symbol.toUpperCase().trim()}`;

          await redisClient.zadd(key, timestamp, JSON.stringify(data));
          await redisClient.expire(key, 86400); // 24 hours

          io.to(symbol.trim()).emit('stock-update', { symbol, data });
          // console.log(`📈 Live stock update sent for ${symbol}`);
        } 
        
        else if (topic === 'transactions') {
          const parsed: TransactionMessage = JSON.parse(value);
          const { event, data } = parsed;

          if (event === 'transaction_created') {
            const { userId, stockSymbol, amount, numberOfShares, averagePrice, transactionId } = data;
            await addToPortfolio(userId, transactionId, stockSymbol, numberOfShares, parseFloat(amount), averagePrice);
            console.log(`💰 Transaction created for user ${userId} with stock ${stockSymbol}`);
          } else {
            console.warn(`⚠️ Unhandled transaction event: ${event}`);
          }
        } 
        
        else {
          console.warn(`⚠️ Unhandled topic: ${topic}`);
        }
      } catch (err) {
        console.error('❌ Failed to process message:', err);
      }
    },
  });

  console.log("✅ Kafka consumer is listening...");
};
