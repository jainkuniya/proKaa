import React, { PureComponent } from 'react';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';

import ReactJson from 'react-json-view';
import Protobuf, { Root } from 'protobufjs';
import styles from './Home.css';
import { GlobalState } from '../reducers/types';
import KafkaConsumer, { ProKaaKafkaMessage } from '../kafka/consumeMessages';

type State = {
  messages: ReadonlyArray<{
    // eslint-disable-next-line @typescript-eslint/ban-types
    content: string | Object;
    offset: string;
    topic: string;
    partition: number;
  }>;
};

type Props = {
  msgName?: string;
  protoFile?: string;
  pkgName?: string;

  isProtoEnabled: boolean;
  kafkaTopic: string;
  kafkaHost: string;

  onError: (errMsg: string) => void;
};

class ConsumerPanel extends PureComponent<Props, State> {
  root?: Root;

  kafkaConsumer?: KafkaConsumer;

  constructor(props: Props) {
    super(props);
    this.state = {
      messages: []
    };
  }

  async componentDidMount() {
    const { kafkaTopic, kafkaHost, protoFile } = this.props;
    if (protoFile) {
      this.root = await Protobuf.load(protoFile);
    }
    this.kafkaConsumer = new KafkaConsumer(kafkaHost, kafkaTopic);
    this.kafkaConsumer.start(this.onMessage, this.onError);
  }

  async componentDidUpdate(prevProps: Props) {
    const { kafkaTopic, kafkaHost, protoFile } = this.props;
    if (
      kafkaTopic !== prevProps.kafkaTopic ||
      kafkaHost !== prevProps.kafkaHost
    ) {
      this.kafkaConsumer = new KafkaConsumer(kafkaHost, kafkaTopic);
      this.kafkaConsumer.start(this.onMessage, this.onError);
    }
    if (protoFile !== prevProps.protoFile && protoFile) {
      this.root = await Protobuf.load(protoFile);
    }
  }

  componentWillUnmount() {
    this.kafkaConsumer?.destroy();
  }

  onMessage = ({ message, partition, topic }: ProKaaKafkaMessage) => {
    const { messages } = this.state;
    const { pkgName, msgName, isProtoEnabled, onError } = this.props;
    if (this.root && isProtoEnabled) {
      const protoMessage = this.root.lookupType(`${pkgName}.${msgName}`);
      try {
        const decodeMsg = protoMessage.decode(message.value);
        this.setState({
          messages: [
            { content: decodeMsg, offset: message.offset, partition, topic },
            ...messages
          ]
        });
      } catch (e) {
        this.setState({
          messages: [
            {
              content: message.value?.toString(),
              offset: message.offset,
              partition,
              topic
            },
            ...messages
          ]
        });
        onError('Select proto message to decode');
      }
    } else {
      this.setState({
        messages: [
          {
            content: message.value.toString(),
            offset: message.offset,
            partition,
            topic
          },
          ...messages
        ]
      });
    }
  };

  onError = (error: string) => {
    const { onError } = this.props;
    onError(error);
  };

  render() {
    const { messages } = this.state;
    return (
      <div className={styles.consumerPanelWrapper}>
        <div className={styles.panelHeading}>Kafka Consumer</div>
        {messages.map(msg => {
          return (
            <div className={styles.consumnerMsgContainer} key={msg.offset}>
              <p className={styles.offsetText}>
                {`Topic: ${msg.topic} Partition: ${msg.partition} Offset: ${msg.offset}`}
              </p>
              {typeof msg.content === 'object' ? (
                <ReactJson
                  key={msg.offset}
                  theme="summerfruit:inverted"
                  name={false}
                  displayDataTypes={false}
                  displayObjectSize={false}
                  enableClipboard={false}
                  src={msg.content}
                />
              ) : (
                <div>{msg.content}</div>
              )}
            </div>
          );
        })}
      </div>
    );
  }
}

function mapStateToProps(state: GlobalState) {
  return {
    isProtoEnabled: state.appConfig.protoEnabled,
    kafkaHost: state.appConfig.kafkaHost,
    kafkaTopic: state.appConfig.kafkaTopic
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return bindActionCreators({}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ConsumerPanel);
