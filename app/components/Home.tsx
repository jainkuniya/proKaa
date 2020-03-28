import React, { PureComponent } from 'react';
import AceEditor from 'react-ace';
import kafka from 'kafka-node';

import styles from './Home.css';

type State = {
  message: string;
  host: string;
};

type Props = {};

export default class Home extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      message: '',
      host: ''
    };
  }

  onChange = (message: string) => {
    this.setState({
      message
    });
  };

  handleHostChange = (host: { target: { value: string } }) => {
    this.setState({
      host: host.target.value
    });
  };

  sendMessage = () => {
    console.log('Fdasfsad');
    const { KeyedMessage, Producer } = kafka;
    const client = new kafka.KafkaClient();
    const producer = new Producer(client);
    const km = new KeyedMessage('key', 'message');
    const payloads = [
      { topic: 'topic1', messages: 'hi', partition: 0 },
      { topic: 'topic2', messages: ['hello', 'world', km] }
    ];
    producer.on('ready', () => {
      producer.send(payloads, (err, data) => {
        console.log(data);
      });
    });

    producer.on('error', err => {
      console.log(err);
    });
  };

  onLoad = () => {};

  render() {
    const { host, message } = this.state;
    return (
      <div className={styles.container} data-tid="container">
        <input
          value={host}
          className={styles.addressBar}
          placeholder="kafkaHost:9092"
          onChange={e => {
            this.handleHostChange(e);
          }}
        />
        <hr />
        <AceEditor
          placeholder="Placeholder Text"
          mode="javascript"
          theme="monokai"
          name="blah2"
          onLoad={this.onLoad}
          onChange={this.onChange}
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

        <button type="button" onClick={this.sendMessage}>
          Push
        </button>
      </div>
    );
  }
}
