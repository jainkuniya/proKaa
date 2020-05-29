import React, { PureComponent } from 'react';
import Alert from '@material-ui/lab/Alert';
import Fab from '@material-ui/core/Fab';
import ClipLoader from 'react-spinners/ClipLoader';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import ReactJson from 'react-json-view';
import { v4 as uuidv4 } from 'uuid';
import { Producer } from 'kafka-node';

import {
  GlobalState,
  ProtoFile,
  ProKaaKafkaClientState
} from '../reducers/types';
import styles from './Home.css';

import generateMockData from '../mock/generateMockData';
import publishMessage from '../kafka/publishMessage';
import {
  updateKafkaTopicAction,
  updateKafkaHostAction
} from '../actions/appConfig';
import ConsumerPanel from './ConsumerPanel';
import { toggleIsConsumerConnectingAction } from '../actions/appCache';
import InputField from './InputField';
import ProkaaKafkaClient from '../kafka/ProkaaKafkaClient';
import ProKaaError from '../ProKaaError';
import { ProKaaMessage } from './types';

type State = {
  message: ProKaaMessage;
  isSendMsgLoading: boolean;
  kafkaClientState: ProKaaKafkaClientState;
  prokaaKafkaClient?: ProkaaKafkaClient;
  error?: ProKaaError;
  producer?: Producer;
};

type Props = {
  message: ProKaaMessage;
  kafkaHost: string;
  isProtoEnabled: boolean;
  consumerState: ProKaaKafkaClientState;
  protos: ProtoFile[];
  kafkaTopic: string;
  onKafkaTopicChange: (topic: string) => void;
  onKafkaHostChange: (kafkaHost: string) => void;
  toggleIsConsumerConnecting: (consumerState: ProKaaKafkaClientState) => void;
};

class RightPanel extends PureComponent<Props, State> {
  prokaaKafkaClient?: ProkaaKafkaClient;

  constructor(props: Props) {
    super(props);

    this.state = {
      message: props.message,
      isSendMsgLoading: false,
      kafkaClientState: ProKaaKafkaClientState.CONNECTING
    };
  }

  static getDerivedStateFromProps(props: Props, state: State) {
    return {
      ...state,
      message: props.message
    };
  }

  componentDidMount() {
    const { kafkaHost } = this.props;
    this.connectKafka(kafkaHost);
  }

  updateProducer = (newProducer?: Producer, error?: string) => {
    const { producer } = this.state;
    if (producer) {
      producer.close();
    }
    this.setState({ producer: newProducer, error });
  };

  handleMessageChange = (event: { target: { value: string } }) => {
    this.setState({
      message: { value: event.target.value }
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onMessageEdit = (edit: { updated_src: any }) => {
    const { message } = this.state;
    this.setState({
      message: {
        ...message,
        value: edit.updated_src
      }
    });
  };

  updateTopic = (kafkaTopic: string) => {
    const { onKafkaTopicChange } = this.props;
    onKafkaTopicChange(kafkaTopic);
  };

  sendMessage = async () => {
    const { message, prokaaKafkaClient } = this.state;
    if (!prokaaKafkaClient) {
      this.onError(new ProKaaError('please connect to the kafka'));
      return;
    }

    const { kafkaTopic } = this.props;
    publishMessage(
      prokaaKafkaClient,
      message.value,
      uuidv4(),
      kafkaTopic,
      error => this.setState({ error }),
      this.toggleSendMsgLoading,
      message.name,
      message.protoPath,
      message.packageName
    );
  };

  onError = (error: ProKaaError) => {
    this.setState({
      error
    });
  };

  toggleSendMsgLoading = (isSendMsgLoading: boolean) => {
    this.setState({
      isSendMsgLoading
    });
  };

  connectKafka = async (kafkaHost: string) => {
    const { onKafkaHostChange, toggleIsConsumerConnecting } = this.props;
    const prokaaKafkaClient = ProkaaKafkaClient.getInstance(kafkaHost);

    this.setState({
      kafkaClientState: ProKaaKafkaClientState.CONNECTING
    });
    try {
      await prokaaKafkaClient.connectProducer();
      this.setState({
        error: undefined,
        kafkaClientState: ProKaaKafkaClientState.CONNECTED,
        prokaaKafkaClient
      });
      onKafkaHostChange(kafkaHost);
    } catch (e) {
      toggleIsConsumerConnecting(ProKaaKafkaClientState.ERROR);
      this.setState({
        error: e,
        kafkaClientState: ProKaaKafkaClientState.ERROR,
        prokaaKafkaClient: undefined
      });
    }
  };

  render() {
    const {
      message,
      error,
      isSendMsgLoading,
      kafkaClientState,
      prokaaKafkaClient
    } = this.state;
    const { consumerState, isProtoEnabled, kafkaHost, kafkaTopic } = this.props;
    const isKafkaHostInputDisabled =
      kafkaClientState === ProKaaKafkaClientState.CONNECTING;
    const isKafkaHostButtonDisabeld =
      kafkaClientState === ProKaaKafkaClientState.CONNECTED;

    const iskafkaHostConnecting =
      kafkaClientState === ProKaaKafkaClientState.CONNECTING;

    return (
      <div className={styles.rightPanel}>
        <div>
          <InputField
            actionText="Connect"
            label="Kafka Host:"
            initialValue={kafkaHost}
            onSubmit={this.connectKafka}
            isInputDisable={isKafkaHostInputDisabled}
            isSubmitDisable={isKafkaHostButtonDisabeld}
            isLoading={iskafkaHostConnecting}
          />
          <InputField
            actionText="Update"
            label="Kafka Topic:"
            initialValue={kafkaTopic}
            onSubmit={this.updateTopic}
            isInputDisable={consumerState === ProKaaKafkaClientState.CONNECTING}
            isSubmitDisable={consumerState === ProKaaKafkaClientState.CONNECTED}
            isLoading={consumerState === ProKaaKafkaClientState.CONNECTING}
          />
        </div>
        <div className={styles.body}>
          <div className={styles.messageContainer}>
            {!isProtoEnabled ? (
              <textarea
                className={styles.messageInput}
                placeholder="start typing here 😃"
                value={
                  // just to make type happy
                  typeof message.value === 'string' ? message.value : ''
                }
                onChange={this.handleMessageChange}
              />
            ) : (
              <ReactJson
                theme="summerfruit:inverted"
                name={false}
                displayDataTypes={false}
                displayObjectSize={false}
                enableClipboard={false}
                // just to make type happy
                src={typeof message.value === 'object' ? message.value : {}}
                onEdit={this.onMessageEdit}
                onAdd={this.onMessageEdit}
                onDelete={this.onMessageEdit}
              />
            )}
          </div>
          <div className={styles.separator}>
            <Fab
              className={styles.pushButton}
              type="button"
              onClick={this.sendMessage}
              size="large"
              style={{
                color: 'white',
                backgroundColor: 'rgb(245, 0, 87)',
                padding: 36,
                lineHeight: 0
              }}
            >
              {!isSendMsgLoading && <span>Push</span>}
              <ClipLoader
                size={20}
                color="#ffffff"
                loading={isSendMsgLoading}
              />
            </Fab>
          </div>
          <div className={styles.consumerPanel}>
            <ConsumerPanel
              prokaaKafkaClient={prokaaKafkaClient}
              msgName={message.name}
              protoFile={message.protoPath}
              pkgName={message.packageName}
            />
          </div>
        </div>
        {error && <Alert severity="error">{error.message}</Alert>}
      </div>
    );
  }
}

function mapStateToProps(state: GlobalState) {
  return {
    kafkaHost: state.appConfig.kafkaHost,
    isProtoEnabled: state.appConfig.protoEnabled,
    protos: state.appCache.protos,
    kafkaTopic: state.appConfig.kafkaTopic,
    consumerState: state.appCache.consumerState
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return bindActionCreators(
    {
      onKafkaTopicChange: updateKafkaTopicAction,
      onKafkaHostChange: updateKafkaHostAction,
      toggleIsConsumerConnecting: toggleIsConsumerConnectingAction
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(RightPanel);
