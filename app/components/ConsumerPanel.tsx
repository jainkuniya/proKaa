import React, { PureComponent } from 'react';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { Message } from 'kafka-node';

import ReactJson from 'react-json-view';
import Protobuf, { Root } from 'protobufjs';
import styles from './Home.css';
import { GlobalState } from '../reducers/types';
import KafkaConsumer from '../kafka/consumeMessages';

type State = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  messages: ReadonlyArray<{ content: string | Object; offset?: number }>;
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
    this.kafkaConsumer = new KafkaConsumer(kafkaHost, kafkaTopic, 0);
    this.kafkaConsumer.start(this.onMessage, this.onError);
  }

  async componentDidUpdate(prevProps: Props) {
    const { kafkaTopic, kafkaHost, protoFile } = this.props;
    if (kafkaTopic !== prevProps.kafkaTopic) {
      this.kafkaConsumer?.changeTopic(kafkaTopic, this.onError);
    }
    if (protoFile !== prevProps.protoFile && protoFile) {
      this.root = await Protobuf.load(protoFile);
    }
  }

  componentWillUnmount() {
    this.kafkaConsumer?.destroy();
  }

  onMessage = (message: Message) => {
    const { messages } = this.state;
    const { pkgName, msgName, isProtoEnabled, onError } = this.props;
    if (this.root && isProtoEnabled) {
      const protoMessage = this.root.lookupType(`${pkgName}.${msgName}`);
      try {
        const decodeMsg = protoMessage.decode(message.value);
        this.setState({
          messages: [
            { content: decodeMsg, offset: message.offset },
            ...messages
          ]
        });
      } catch (e) {
        this.setState({
          messages: [
            { content: message.value.toString(), offset: message.offset },
            ...messages
          ]
        });
        onError('Select proto message to decode');
      }
    } else {
      this.setState({
        messages: [
          { content: message.value.toString(), offset: message.offset },
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
    const { messages, error } = this.state;
    return (
      <div className={styles.consumerPanelWrapper}>
        <div className={styles.panelHeading}>Kafka consumner</div>
        {error && JSON.stringify(error)}
        {messages.map(msg => {
          return (
            <div className={styles.consumnerMsgContainer} key={msg.offset}>
              <span className={styles.offsetText}>
                {`Offset: ${msg.offset}`}
              </span>
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
