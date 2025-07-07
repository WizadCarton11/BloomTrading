import { EachMessagePayload, Kafka } from 'kafkajs';
import { Server as SocketIOServer } from 'socket.io';
import { completeTransaction } from '../services/account-service';
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
    
  };  
}

export const createKafkaConsumer = async () => {
  const kafka = new Kafka({
    clientId: 'stock-consumer',
    // user environment variable for brokers
    brokers: [ process.env.KAFKA_BROKER || 'localhost:9092' ] // Replace with your broker addresses
  });

  const consumer = kafka.consumer({ groupId: 'transaction-group' });

  await consumer.connect();
  await consumer.subscribe({ topic: 'transactions_success', fromBeginning: false });
  
    await consumer.run({
    eachMessage: async ({ topic, message }: EachMessagePayload) => {
      try {
        const value = message.value?.toString();
        console.log(`📬 Received message on topic ${topic}:`, value);
        if (!value) return;
        if (topic === 'transactions_success') {
          const parsed: TransactionMessage = JSON.parse(value);
          const { event, data } = parsed;
          if (event === 'transaction_completed') {
            const { userId, transactionId } = data;
            completeTransaction(transactionId)
            // Here you can handle the transaction completion logic
            console.log(`💰 Transaction completed for user ${userId} with ID ${transactionId}`);
          } else {
            console.warn(`⚠️ Unhandled transaction event: ${event}`);
          }
        } 
        
      } catch (err) {
        console.error('❌ Failed to process message:', err);
      }
    },
  });

  console.log("✅ Kafka consumer is listening...");
};
