import React, { PureComponent } from 'react';
import Alert from '@material-ui/lab/Alert';
import Fab from '@material-ui/core/Fab';
import ClipLoader from 'react-spinners/ClipLoader';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import ReactJson from 'react-json-view';
import { v4 as uuidv4 } from 'uuid';

import { GlobalState } from '../reducers/types';
import styles from './Home.css';

import ConsumerPanel from './ConsumerPanel';
import { updateMessageAction } from '../actions/appCache';
import ProkaaKafkaClient from '../kafka/ProkaaKafkaClient';
import ProKaaError from '../ProKaaError';
import { ProKaaMessage } from './types';
import publishMessage from '../kafka/publishMessage';

type State = {
  isSendMsgLoading: boolean;
  error?: ProKaaError;
};

type Props = {
  message: ProKaaMessage;
  error?: ProKaaError;
  prokaaKafkaClient?: ProkaaKafkaClient;
  kafkaHost: string;
  kafkaTopic: string;
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
    const { message, prokaaKafkaClient } = this.props;
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
    const { isSendMsgLoading, error } = this.state;
    const { message, prokaaKafkaClient } = this.props;

    return (
      <div className={styles.rightPanel}>
        <div className={styles.body}>
          <div className={styles.messageContainer}>
            {typeof message.value === 'string' && (
              <textarea
                className={styles.messageInput}
                placeholder="start typing here 😃"
                value={message.value}
                onChange={this.handleMessageChange}
              />
            )}
            {typeof message.value === 'object' && (
              <ReactJson
                theme="summerfruit:inverted"
                name={false}
                displayDataTypes={false}
                displayObjectSize={false}
                enableClipboard={false}
                src={message.value}
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
      kafkaHost: state.appConfig.kafkaHost,
      protos: state.appCache.protos,
      kafkaTopic: state.appConfig.kafkaTopic
    };
  },
  (dispatch: Dispatch) => {
    return bindActionCreators(
      {
        updateMessage: updateMessageAction
      },
      dispatch
    );
  }
)(RightPanelBody);
