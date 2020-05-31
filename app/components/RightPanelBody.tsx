import React, { PureComponent } from 'react';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import ReactJson from 'react-json-view';

import { GlobalState } from '../reducers/types';
import styles from './Home.css';

import ConsumerPanel from './ConsumerPanel';
import { updateMessageAction } from '../actions/appCache';
import ProkaaKafkaClient from '../kafka/ProkaaKafkaClient';
import { ProKaaMessage } from './types';
import SendButton from './SendButton';

type Props = {
  message: ProKaaMessage;
  prokaaKafkaClient?: ProkaaKafkaClient;
  kafkaHost: string;
  kafkaTopic: string;
  updateMessage: (message: ProKaaMessage) => void;
};

class RightPanelBody extends PureComponent<Props> {
  handleMessageChange = (event: { target: { value: string } }) => {
    const { updateMessage } = this.props;
    updateMessage({ value: event.target.value });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onMessageEdit = (edit: { updated_src: any }) => {
    const { message, updateMessage } = this.props;
    updateMessage({ ...message, value: edit.updated_src });
  };

  render() {
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
          <SendButton prokaaKafkaClient={prokaaKafkaClient} />
          <div className={styles.consumerPanel}>
            <ConsumerPanel
              prokaaKafkaClient={prokaaKafkaClient}
              msgName={message.name}
              protoFile={message.protoPath}
              pkgName={message.packageName}
            />
          </div>
        </div>
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
