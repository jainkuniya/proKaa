import React, { PureComponent } from 'react';
import ReactJson from 'react-json-view';
import kafka from 'kafka-node';

import styles from './Home.css';
import SideBar from './SideBar';

type State = {
  message: { type: 'string' | 'object'; content: string | Record<string, any> };
  host: string;
  topic: string;
};

type Props = {};

export default class Home extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      message: { type: 'string', content: '' },
      host: '',
      topic: ''
    };
  }

  handleMessageChange = (event: { target: { value: string } }) => {
    this.setState({
      message: { type: 'string', content: event.target.value }
    });
  };

  onMessageEdit = edit => {
    this.setState({
      message: { type: 'object', content: edit.updated_src }
    });
  };

  handleHostChange = (host: { target: { value: string } }) => {
    this.setState({
      host: host.target.value
    });
  };

  handleTopicChange = (host: { target: { value: string } }) => {
    this.setState({
      topic: host.target.value
    });
  };

  sendMessage = () => {
    const { host, message, topic } = this.state;
    const { Producer } = kafka;
    const client = new kafka.KafkaClient({ kafkaHost: host });
    const producer = new Producer(client);
    const payloads = [{ topic, messages: message }];
    producer.on('ready', () => {
      producer.send(payloads, (err, data) => {
        console.log(err, data);
      });
    });

    producer.on('error', err => {
      console.log(err);
    });
  };

  getValueOfType = (type: string, fieldName: string) => {
    switch (type) {
      case 'string': {
        const fieldNameLower = fieldName.toLowerCase();

        if (fieldNameLower.startsWith('id') || fieldNameLower.endsWith('id')) {
          return 'uuid';
        }

        return 'Hello';
      }
      case 'number':
        return 10;
      case 'bool':
        return true;
      case 'int32':
        return 10;
      case 'int64':
        return 20;
      case 'uint32':
        return 100;
      case 'uint64':
        return 100;
      case 'sint32':
        return 100;
      case 'sint64':
        return 1200;
      case 'fixed32':
        return 1400;
      case 'fixed64':
        return 1500;
      case 'sfixed32':
        return 1600;
      case 'sfixed64':
        return 1700;
      case 'double':
        return 1.4;
      case 'float':
        return 1.1;
      case 'bytes':
        return Buffer.from('Hello');
      default:
        return null;
    }
  };

  onMessageItemSelect = (msg: {
    name: string;
    fields: Record<string, any>;
  }) => {
    console.log(msg);
    const obj = {};
    Object.keys(msg.fields).forEach(fieldName => {
      obj[fieldName] = this.getValueOfType(
        msg.fields[fieldName].type,
        fieldName
      );
    });
    this.setState({
      message: { type: 'object', content: obj }
    });
  };

  render() {
    const { host, message, topic } = this.state;
    return (
      <div className={styles.container} data-tid="container">
        <div className={styles.sideBar}>
          <SideBar onMessageItemSelect={this.onMessageItemSelect} />
        </div>
        <div className={styles.rightPanel}>
          <span className={styles.inputRow}>
            <span className={styles.label}>Kafka Host:</span>
            <input
              value={host}
              className={styles.input}
              placeholder="localhost:9092"
              onChange={e => {
                this.handleHostChange(e);
              }}
            />
          </span>
          <span className={styles.inputRow}>
            <span className={styles.label}>Topic:</span>
            <input
              value={topic}
              className={styles.input}
              placeholder="topic"
              onChange={e => {
                this.handleTopicChange(e);
              }}
            />
          </span>
          {message.type === 'string' ? (
            <input
              value={message.content}
              onChange={this.handleMessageChange}
            />
          ) : (
            <ReactJson
              theme="summerfruit:inverted"
              name={false}
              displayDataTypes={false}
              displayObjectSize={false}
              enableClipboard={false}
              src={{ ...message.content }}
              onEdit={this.onMessageEdit}
            />
          )}

          <button
            className={styles.pushButton}
            type="button"
            onClick={this.sendMessage}
          >
            Push
          </button>
        </div>
      </div>
    );
  }
}
