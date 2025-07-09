// kafka/producer.ts
import { Kafka, Producer } from 'kafkajs';

let producer: Producer;

export const createKafkaProducer = async () => {
  const kafka = new Kafka({
    clientId: 'fastify-producer',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
  });

  producer = kafka.producer();
  await producer.connect();
  console.log('🚀 Kafka Producer connected');
};

export const sendKafkaMessage = async (topic: string, message: object) => {
  if (!producer) {
    throw new Error('Producer not initialized. Call createKafkaProducer() first.');
  }
  console.log(`📤 Sending message to topic ${topic}:`, message);
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(message) }],
  });

  console.log(`📤 Sent message to topic ${topic}`);
};
