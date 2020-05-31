import React, { PureComponent } from 'react';
import Fab from '@material-ui/core/Fab';
import ClipLoader from 'react-spinners/ClipLoader';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import { GlobalState } from '../reducers/types';
import styles from './Home.css';

import ProkaaKafkaClient from '../kafka/ProkaaKafkaClient';
import ProKaaError from '../ProKaaError';
import { ProKaaMessage } from './types';
import sendMessage from '../kafka/sendMessage';
import { updateErrorAction } from '../actions/appCache';

type State = {
  isSendMsgLoading: boolean;
};

type Props = {
  message: ProKaaMessage;
  kafkaHost: string;
  kafkaTopic: string;

  prokaaKafkaClient?: ProkaaKafkaClient;
  updateError: (error?: ProKaaError) => void;
};

class SendButton extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isSendMsgLoading: false
    };
  }

  sendMessage = async () => {
    const { message, prokaaKafkaClient, updateError } = this.props;
    if (!prokaaKafkaClient) {
      updateError(new ProKaaError('please connect to the kafka'));
      return;
    }

    const { kafkaTopic } = this.props;
    sendMessage(
      prokaaKafkaClient,
      message,
      uuidv4(),
      kafkaTopic,
      updateError,
      this.toggleSendMsgLoading
    );
  };

  toggleSendMsgLoading = (isSendMsgLoading: boolean) => {
    this.setState({
      isSendMsgLoading
    });
  };

  render() {
    const { isSendMsgLoading } = this.state;

    return (
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
          <ClipLoader size={20} color="#ffffff" loading={isSendMsgLoading} />
        </Fab>
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
        updateError: updateErrorAction
      },
      dispatch
    );
  }
)(SendButton);
