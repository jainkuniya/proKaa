import React, { PureComponent } from 'react';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { Button, Snackbar } from '@material-ui/core';
import ReactJson from 'react-json-view';
import Protobuf, { Root } from 'protobufjs';

import styles from './Home.css';
import { GlobalState, ProKaaKafkaClientState } from '../reducers/types';
import { toggleIsConsumerConnectingAction } from '../actions/appCache';
import ProkaaKafkaClient, {
  ProKaaError,
  ProKaaKafkaMessage
} from '../kafka/ProkaaKafkaClient';

type State = {
  error?: ProKaaError;
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
      messages: []
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
      this.onError({
        message: `Unable to create consumer: ${e.type} ${kafkaTopic}`,
        onRetry: e.retriable
          ? () => {
              this.onError();
              return this.connectConsumer();
            }
          : undefined
      });
    }
  };

  onMessage = ({ message, partition, topic }: ProKaaKafkaMessage) => {
    const { messages } = this.state;
    const { pkgName, msgName, isProtoEnabled } = this.props;
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
        this.onError({
          message: 'Select proto message to decode',
          autoHideDuration: 2000
        });
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

  onError = (error?: ProKaaError) => {
    this.setState({
      error
    });
  };

  render() {
    const { messages, error } = this.state;
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
        <Snackbar
          action={
            error?.onRetry && (
              <Button color="secondary" size="small" onClick={error?.onRetry}>
                Retry
              </Button>
            )
          }
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          open={error !== undefined}
          autoHideDuration={error?.autoHideDuration}
          // TransitionComponent={state.Transition}
          message={error?.message}
          key={JSON.stringify(error)}
        />
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