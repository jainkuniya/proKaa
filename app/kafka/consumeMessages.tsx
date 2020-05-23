import { Consumer, KafkaClient, Message, ConsumerGroup } from 'kafka-node';
import { v4 as uuidv4 } from 'uuid';

export default class KafkaConsumer {
  kafkaHost = 'localhost:9092';

  topic = 'topic123';

  partition = 0;

  client?: KafkaClient;

  consumer?: Consumer;

  constructor(kafkaHost: string, topic: string, partition: number) {
    this.kafkaHost = kafkaHost;
    this.topic = topic;
    this.partition = partition;
  }

  start = (
    onMessage: (message: Message) => void,
    onError: (errMsg: string) => void
  ) => {
    this.client = new KafkaClient({ kafkaHost: this.kafkaHost });
    this.consumer = new Consumer(
      this.client,
      [{ topic: this.topic, partition: this.partition }],
      {
        autoCommit: true,
        groupId: uuidv4(),
        fromOffset: false,
        encoding: 'buffer'
      }
    );

    const vg = new ConsumerGroup(
      { kafkaHost: this.kafkaHost, groupId: uuidv4(), autoCommit: false },
      ['topic123']
    );

    this.consumer.on('message', message => {
      onMessage(message);
    });

    this.client.on('error', err => {
      onError(err);
    });

    this.consumer.on('error', err => {
      onError(err);
    });

    this.consumer.on('offsetOutOfRange', err => {
      onError(err);
    });
  };

  changeTopic = (newTopic: string, onError: (errMsg: string) => void) => {
    this.consumer?.removeTopics(this.topic, onError);
    this.consumer?.addTopics([newTopic], onError);
    this.topic = newTopic;
  };

  destroy = () => {
    this.client?.close();
    this.consumer?.close(true, () => {});
  };
}
