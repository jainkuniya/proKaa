import React, { PureComponent } from 'react';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import Alert from '@material-ui/lab/Alert';
import ReactJson from 'react-json-view';
import Protobuf, { Root } from 'protobufjs';

import { Button } from '@material-ui/core';
import ClipLoader from 'react-spinners/ClipLoader';
import styles from './Home.css';
import { GlobalState, ProKaaKafkaClientState } from '../reducers/types';
import { toggleIsConsumerConnectingAction } from '../actions/appCache';
import ProkaaKafkaClient, {
  ProKaaKafkaMessage
} from '../kafka/ProkaaKafkaClient';

import ProKaaError from '../ProKaaError';
import InputField from './InputField';

type Message = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  content: string | Object;
  offset: string;
  topic: string;
  partition: number;
};

type State = {
  error?: ProKaaError;
  messages: ReadonlyArray<Message>;
  isUpdatingOffset: boolean;
  isGettingMoreMessages: boolean;
  isPaused: boolean;
};

type Props = {
  msgName?: string;
  protoFile?: string;
  pkgName?: string;
  prokaaKafkaClient?: ProkaaKafkaClient;

  isProtoEnabled: boolean;
  kafkaTopic: string;
  kafkaHost: string;
  toggleIsConsumerConnecting: (consumerState: ProKaaKafkaClientState) => void;
};

class ConsumerPanel extends PureComponent<Props, State> {
  root?: Root;

  isSubscribed = false;

  constructor(props: Props) {
    super(props);
    this.state = {
      messages: [],
      isUpdatingOffset: false,
      isGettingMoreMessages: false,
      isPaused: false
    };
  }

  async componentDidMount() {
    const { protoFile, prokaaKafkaClient } = this.props;

    if (prokaaKafkaClient) {
      this.connectConsumer();
    }
    if (protoFile) {
      this.root = await Protobuf.load(protoFile);
    }
  }

  async componentDidUpdate(prevProps: Props) {
    const { protoFile, kafkaTopic, prokaaKafkaClient } = this.props;

    if (protoFile !== prevProps.protoFile && protoFile) {
      this.root = await Protobuf.load(protoFile);
    }

    if (kafkaTopic !== prevProps.kafkaTopic && kafkaTopic) {
      this.connectConsumer();
    }

    if (prokaaKafkaClient !== prevProps.prokaaKafkaClient) {
      this.connectConsumer();
    }
  }

  connectConsumer = async () => {
    const {
      kafkaTopic,
      toggleIsConsumerConnecting,
      prokaaKafkaClient
    } = this.props;
    if (!prokaaKafkaClient) {
      return;
    }
    try {
      toggleIsConsumerConnecting(ProKaaKafkaClientState.CONNECTING);
      await prokaaKafkaClient.connectConsumer(kafkaTopic, false);
      if (!this.isSubscribed) {
        prokaaKafkaClient.addConsumer(this.onMessage);
        this.isSubscribed = true;
      }
      toggleIsConsumerConnecting(ProKaaKafkaClientState.CONNECTED);
      this.onError();
    } catch (e) {
      toggleIsConsumerConnecting(ProKaaKafkaClientState.ERROR);
      this.onError(e);
    }
  };

  onMessage = ({ message, partition, topic }: ProKaaKafkaMessage): Message => {
    this.setState({
      isGettingMoreMessages: false
    });
    let newMessage;
    const { pkgName, msgName, isProtoEnabled } = this.props;
    if (this.root && isProtoEnabled) {
      const protoMessage = this.root.lookupType(`${pkgName}.${msgName}`);
      try {
        const decodeMsg = protoMessage.decode(message.value);
        newMessage = {
          content: decodeMsg,
          offset: message.offset,
          partition,
          topic
        };
      } catch (e) {
        newMessage = {
          content: message.value?.toString(),
          offset: message.offset,
          partition,
          topic
        };
        this.onError(new ProKaaError('Select proto message to decode'));
      }
    } else {
      newMessage = {
        content: message.value.toString(),
        offset: message.offset,
        partition,
        topic
      };
    }

    const { messages } = this.state;

    this.setState({
      messages: [newMessage, ...messages]
    });

    if (messages.length > 100) {
      const { kafkaTopic, prokaaKafkaClient } = this.props;
      prokaaKafkaClient?.pauseConsumer(kafkaTopic);
      this.setState({
        isPaused: true
      });
    }

    return newMessage;
  };

  onError = (error?: ProKaaError) => {
    this.setState({
      error
    });
  };

  updateOffset = (offset: string) => {
    const { kafkaTopic, prokaaKafkaClient } = this.props;

    if (!offset) {
      this.onError(new ProKaaError('Invalid  offset'));
      return;
    }

    if (!prokaaKafkaClient) {
      this.onError(new ProKaaError('Not able to connect to kafka'));
      return;
    }

    this.setState({
      isUpdatingOffset: true,
      messages: []
    });

    try {
      prokaaKafkaClient.updateOffset(kafkaTopic, offset, () =>
        this.setState({
          isUpdatingOffset: false
        })
      );
    } catch (e) {
      this.setState({
        isUpdatingOffset: false
      });
      this.onError(e);
    }
  };

  getMore = () => {
    const { isPaused } = this.state;
    if (!isPaused) {
      return;
    }

    const { kafkaTopic, prokaaKafkaClient } = this.props;

    if (!prokaaKafkaClient) {
      this.onError(new ProKaaError('Not able to connect to kafka'));
      return;
    }

    prokaaKafkaClient.resumeConsumer(kafkaTopic);

    this.setState({
      isPaused: false,
      messages: [],
      isGettingMoreMessages: true
    });
  };

  render() {
    const {
      messages,
      error,
      isUpdatingOffset,
      isPaused,
      isGettingMoreMessages
    } = this.state;
    return (
      <div className={styles.consumerPanelWrapper}>
        <div className={styles.panelHeader}>
          <div className={styles.panelHeading}>Kafka Consumer</div>
          <InputField
            actionText="Update"
            label="Offset:"
            initialValue="latest"
            onSubmit={this.updateOffset}
            isInputDisable={isUpdatingOffset}
            isSubmitDisable={isUpdatingOffset}
            isLoading={isUpdatingOffset}
          />
          <code>* This will apply offset across all partitions</code>
          {(isPaused || isGettingMoreMessages) && (
            <Button
              color="inherit"
              type="button"
              onClick={this.getMore}
              style={{
                marginLeft: '2px',
                marginRight: '2px',
                backgroundColor: '#FFB74D'
              }}
            >
              {isGettingMoreMessages ? (
                <ClipLoader size={20} color="#ffffff" loading />
              ) : (
                <span> Get more</span>
              )}
            </Button>
          )}
        </div>
        <div className={styles.messagesWrapper}>
          {messages.map(msg => {
            return (
              <div
                className={styles.consumnerMsgContainer}
                key={`${msg.topic}:${msg.partition}:${msg.offset}`}
              >
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
        {error && <Alert severity="error">{error.message}</Alert>}
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
  return bindActionCreators(
    {
      toggleIsConsumerConnecting: toggleIsConsumerConnectingAction
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(ConsumerPanel);
