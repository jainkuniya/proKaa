import {
  Consumer,
  Kafka,
  KafkaMessage,
  Producer,
  RecordMetadata
} from 'kafkajs';

import { v4 as uuidv4 } from 'uuid';

export type ProKaaKafkaMessage = {
  message: KafkaMessage;
  partition: number;
  topic: string;
};

export default class ProkaaKafkaClient {
  kafkaHost = 'localhost:9092';

  kafka?: Kafka;

  consumer?: Consumer;

  producer?: Producer;

  onMessage: (m: ProKaaKafkaMessage) => void = () => {};

  constructor(kafkaHost: string) {
    this.kafkaHost = kafkaHost;

    this.kafka = new Kafka({
      clientId: `prokaa-${uuidv4()}`,
      brokers: [this.kafkaHost]
    });
  }

  sendMessage = (
    key: string,
    topic: string,
    value: Buffer | string
  ): Promise<RecordMetadata[]> => {
    if (!this.producer) {
      return new Promise(() => {
        throw Error('Not able to connect to the producer');
      });
    }

    return this.producer.send({
      topic,
      messages: [{ key, value }]
    });
  };

  connectProducer = (): Promise<void> => {
    this.producer = this.kafka?.producer();

    return (
      this.producer?.connect() ||
      new Promise(() => {
        throw Error('');
      })
    );
  };

  connectConsumer = async (topic: string) => {
    this.consumer = this.kafka?.consumer({
      groupId: `prokaa-${uuidv4()}`,
      allowAutoTopicCreation: false
    });
    await this.consumer?.connect();
    await this.consumer?.subscribe({
      topic
    });
    await this.consumer?.run({
      eachMessage: async ({ partition, message }) => {
        this.onMessage({ message, partition, topic });
      }
    });
  };

  destroy = async () => {
    await this.producer?.disconnect();
    await this.consumer?.disconnect();
    await this.consumer?.stop();
  };
}
