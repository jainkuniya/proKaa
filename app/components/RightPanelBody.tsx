import React, { PureComponent } from 'react';
import Alert from '@material-ui/lab/Alert';
import Fab from '@material-ui/core/Fab';
import ClipLoader from 'react-spinners/ClipLoader';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import ReactJson from 'react-json-view';
import { v4 as uuidv4 } from 'uuid';

import {
  GlobalState,
  ProtoFile,
  ProKaaKafkaClientState
} from '../reducers/types';
import styles from './Home.css';

import publishMessage from '../kafka/publishMessage';
import {
  updateKafkaTopicAction,
  updateKafkaHostAction
} from '../actions/appConfig';
import ConsumerPanel from './ConsumerPanel';
import {
  toggleIsConsumerConnectingAction,
  updateMessageAction
} from '../actions/appCache';
import ProkaaKafkaClient from '../kafka/ProkaaKafkaClient';
import ProKaaError from '../ProKaaError';
import { ProKaaMessage } from './types';

type State = {
  isSendMsgLoading: boolean;
  error?: ProKaaError;
};

type Props = {
  message: ProKaaMessage;
  error?: ProKaaError;
  prokaaKafkaClient?: ProkaaKafkaClient;
  kafkaHost: string;
  isProtoEnabled: boolean;
  consumerState: ProKaaKafkaClientState;
  protos: ProtoFile[];
  kafkaTopic: string;
  onKafkaTopicChange: (topic: string) => void;
  onKafkaHostChange: (kafkaHost: string) => void;
  toggleIsConsumerConnecting: (consumerState: ProKaaKafkaClientState) => void;
  updateMessage: (message: ProKaaMessage) => void;
};

class RightPanelBody extends PureComponent<Props, State> {
  prokaaKafkaClient?: ProkaaKafkaClient;

  constructor(props: Props) {
    super(props);

    this.state = {
      error: props.error,
      isSendMsgLoading: false
    };
  }

  static getDerivedStateFromProps(props: Props, state: State) {
    return {
      ...state,
      message: props.message
    };
  }

  handleMessageChange = (event: { target: { value: string } }) => {
    const { updateMessage } = this.props;
    updateMessage({ value: event.target.value });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onMessageEdit = (edit: { updated_src: any }) => {
    const { message, updateMessage } = this.props;
    updateMessage({ ...message, value: edit.updated_src });
  };

  sendMessage = async () => {
    const { message } = this.state;
    const { prokaaKafkaClient } = this.props;
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

  render() {
    const { message, isSendMsgLoading } = this.state;
    const { isProtoEnabled, prokaaKafkaClient, error } = this.props;

    return (
      <div className={styles.rightPanel}>
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

export default connect(
  (state: GlobalState) => {
    return {
      message: state.appCache.message,
      error: state.appCache.error,
      kafkaHost: state.appConfig.kafkaHost,
      isProtoEnabled: state.appConfig.protoEnabled,
      protos: state.appCache.protos,
      kafkaTopic: state.appConfig.kafkaTopic,
      consumerState: state.appCache.consumerState
    };
  },
  (dispatch: Dispatch) => {
    return bindActionCreators(
      {
        onKafkaTopicChange: updateKafkaTopicAction,
        onKafkaHostChange: updateKafkaHostAction,
        toggleIsConsumerConnecting: toggleIsConsumerConnectingAction,
        updateMessage: updateMessageAction
      },
      dispatch
    );
  }
)(RightPanelBody);
