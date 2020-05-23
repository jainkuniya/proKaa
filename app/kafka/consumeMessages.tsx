import { Consumer, Kafka, KafkaMessage } from 'kafkajs';

import { v4 as uuidv4 } from 'uuid';

export type ProKaaKafkaMessage = {
  message: KafkaMessage;
  partition: number;
  topic: string;
};

export default class KafkaConsumer {
  kafkaHost = 'localhost:9092';

  topic = 'topic123';

  kafka?: Kafka;

  consumer?: Consumer;

  constructor(kafkaHost: string, topic: string) {
    this.kafkaHost = kafkaHost;
    this.topic = topic;
  }

  start = async (
    onMessage: (message: ProKaaKafkaMessage) => void,
    onError: (errMsg: string) => void
  ) => {
    try {
      this.kafka = new Kafka({
        clientId: `prokaa-${uuidv4()}`,
        brokers: [this.kafkaHost]
      });
      this.consumer = this.kafka.consumer({ groupId: `prokaa-${uuidv4()}` });
      await this.consumer.connect();
      await this.consumer.subscribe({
        topic: this.topic
      });
      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          onMessage({ message, partition, topic });
        }
      });
    } catch (e) {
      onError(e);
    }
  };

  destroy = async () => {
    await this.consumer?.stop();
  };
}
