import React, { PureComponent } from 'react';
import AceEditor from 'react-ace';
import kafka from 'kafka-node';

import styles from './Home.css';
import SideBar from './SideBar';

type State = {
  message: string;
  host: string;
  topic: string;
};

type Props = {};

export default class Home extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      message: '',
      host: '',
      topic: ''
    };
  }

  handleMessageChange = (message: string) => {
    this.setState({
      message
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

  render() {
    const { host, message, topic } = this.state;
    return (
      <div className={styles.container} data-tid="container">
        <div className={styles.sideBar}>
          <SideBar />
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
          <AceEditor
            placeholder="message"
            mode="javascript"
            theme="monokai"
            name="blah2"
            onChange={this.handleMessageChange}
            fontSize={14}
            showPrintMargin
            showGutter
            highlightActiveLine
            value={message}
            setOptions={{
              enableBasicAutocompletion: false,
              enableLiveAutocompletion: false,
              enableSnippets: false,
              showLineNumbers: true,
              tabSize: 2
            }}
          />

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
