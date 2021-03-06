import {
  Consumer,
  Kafka,
  KafkaMessage,
  Producer,
  RecordMetadata,
  Admin
} from 'kafkajs';
import { v4 as uuidv4 } from 'uuid';

import ProKaaError from '../ProKaaError';

export type ProKaaKafkaMessage = {
  message: KafkaMessage;
  partition: number;
  topic: string;
};

export default class ProkaaKafkaClient {
  static instance?: ProkaaKafkaClient = undefined;

  static getInstance(kafkaHost?: string) {
    if (
      !ProkaaKafkaClient.instance ||
      kafkaHost !== ProkaaKafkaClient.instance.getKafkaHost()
    ) {
      if (!kafkaHost) {
        throw Error('kafkaHost cannot be undefined');
      }
      ProkaaKafkaClient.instance = new ProkaaKafkaClient(kafkaHost);
    }
    return ProkaaKafkaClient.instance;
  }

  getKafkaHost() {
    return this.kafkaHost;
  }

  kafkaHost = 'localhost:9092';

  groupId = `prokaa-${uuidv4()}`;

  kafka?: Kafka;

  admin?: Admin;

  consumer?: Consumer;

  producer?: Producer;

  onMessage: { (m: ProKaaKafkaMessage): void }[] = [];

  constructor(kafkaHost: string) {
    this.kafkaHost = kafkaHost;

    this.kafka = new Kafka({
      clientId: `prokaa-${uuidv4()}`,
      brokers: [this.kafkaHost]
    });

    this.admin = this.kafka.admin();
  }

  addConsumer = (onMessages: (msg: ProKaaKafkaMessage) => void) => {
    this.onMessage.push(onMessages);
  };

  sendMessage = async (
    key: string,
    topic: string,
    value: Buffer | string
  ): Promise<RecordMetadata[]> => {
    if (!this.producer) {
      throw new ProKaaError('Not able to connect to the producer');
    }

    let records;
    try {
      records = await this.producer.send({
        topic,
        messages: [{ key, value }]
      });
    } catch (e) {
      throw new ProKaaError(e.message);
    }

    // if consumer is not connected, connect it
    if (!this.consumer) {
      this.connectConsumer(topic, true);
    }

    return records;
  };

  connectProducer = async (): Promise<void> => {
    try {
      this.producer = this.kafka?.producer({
        allowAutoTopicCreation: false
      });

      await this.producer?.connect();
    } catch (e) {
      throw new ProKaaError(e.message);
    }
  };

  handleMessage = (messages: ProKaaKafkaMessage) => {
    this.onMessage.forEach(callback => callback(messages));
  };

  connectConsumer = async (topic: string, fromBeginning = false) => {
    try {
      await this.disconnectConsumer();

      this.consumer = this.kafka?.consumer({
        groupId: this.groupId,
        allowAutoTopicCreation: false
      });
      await this.consumer?.connect();

      await this.consumer?.subscribe({
        topic,
        fromBeginning
      });
      await this.consumer?.run({
        eachMessage: async ({ partition, message }) => {
          this.handleMessage({ message, partition, topic });
        }
      });
    } catch (e) {
      // rollback changes
      this.disconnectConsumer();
      throw new ProKaaError(`Unable to create consumer: ${e.message}`);
    }
  };

  updateOffset = async (
    topic: string,
    offset: string,
    onComplete: () => void
  ) => {
    const response = await this.admin?.fetchTopicMetadata({
      topics: [topic]
    });
    const partitions = response.topics[0].partitions.map(partition => ({
      partition: partition.partitionId,
      offset
    }));
    await this.consumer?.stop();
    await this.admin?.setOffsets({
      groupId: this.groupId,
      topic,
      partitions
    });
    onComplete();
    await this.consumer?.run({
      eachMessage: async ({ partition, message }) => {
        this.handleMessage({ message, partition, topic });
      }
    });
  };

  pauseConsumer = (topic: string) => {
    this.consumer?.pause([{ topic }]);
  };

  resumeConsumer = (topic: string) => {
    this.consumer?.resume([{ topic }]);
  };

  disconnectConsumer = async () => {
    await this.consumer?.disconnect();
    await this.consumer?.stop();

    this.consumer = undefined;
  };

  destroy = async () => {
    await this.producer?.disconnect();
    await this.disconnectConsumer();
  };
}
