import React, { PureComponent } from 'react';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';

import { GlobalState, ProKaaKafkaClientState } from '../reducers/types';
import styles from './Home.css';

import {
  updateKafkaTopicAction,
  updateKafkaHostAction
} from '../actions/appConfig';
import {
  toggleIsConsumerConnectingAction,
  updateErrorAction
} from '../actions/appCache';
import InputField from './InputField';
import ProkaaKafkaClient from '../kafka/ProkaaKafkaClient';
import ProKaaError from '../ProKaaError';
import RightPanelBody from './RightPanelBody';
import ErrorBar from './ErrorBar';

type State = {
  kafkaClientState: ProKaaKafkaClientState;
  prokaaKafkaClient?: ProkaaKafkaClient;
};

type Props = {
  kafkaHost: string;
  consumerState: ProKaaKafkaClientState;
  kafkaTopic: string;
  onKafkaTopicChange: (topic: string) => void;
  onKafkaHostChange: (kafkaHost: string) => void;
  toggleIsConsumerConnecting: (consumerState: ProKaaKafkaClientState) => void;
  updateError: (error?: ProKaaError) => void;
};

class RightPanel extends PureComponent<Props, State> {
  prokaaKafkaClient?: ProkaaKafkaClient;

  constructor(props: Props) {
    super(props);

    this.state = {
      kafkaClientState: ProKaaKafkaClientState.CONNECTING
    };
  }

  componentDidMount() {
    const { kafkaHost } = this.props;
    this.connectKafka(kafkaHost);
  }

  updateTopic = (kafkaTopic: string) => {
    const { onKafkaTopicChange } = this.props;
    onKafkaTopicChange(kafkaTopic);
  };

  connectKafka = async (kafkaHost: string) => {
    const {
      onKafkaHostChange,
      toggleIsConsumerConnecting,
      updateError
    } = this.props;
    const prokaaKafkaClient = ProkaaKafkaClient.getInstance(kafkaHost);

    this.setState({
      kafkaClientState: ProKaaKafkaClientState.CONNECTING
    });
    try {
      await prokaaKafkaClient.connectProducer();
      this.setState({
        kafkaClientState: ProKaaKafkaClientState.CONNECTED,
        prokaaKafkaClient
      });
      updateError();
      onKafkaHostChange(kafkaHost);
    } catch (e) {
      toggleIsConsumerConnecting(ProKaaKafkaClientState.ERROR);
      this.setState({
        kafkaClientState: ProKaaKafkaClientState.ERROR,
        prokaaKafkaClient: undefined
      });
      updateError(e);
    }
  };

  render() {
    const { kafkaClientState, prokaaKafkaClient } = this.state;
    const { consumerState, kafkaHost, kafkaTopic } = this.props;
    const isKafkaHostInputDisabled =
      kafkaClientState === ProKaaKafkaClientState.CONNECTING;
    const isKafkaHostButtonDisabeld =
      kafkaClientState === ProKaaKafkaClientState.CONNECTED;

    const iskafkaHostConnecting =
      kafkaClientState === ProKaaKafkaClientState.CONNECTING;

    return (
      <div className={styles.rightPanel}>
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
        <RightPanelBody prokaaKafkaClient={prokaaKafkaClient} />
        <ErrorBar />
      </div>
    );
  }
}

export default connect(
  (state: GlobalState) => {
    return {
      kafkaHost: state.appConfig.kafkaHost,
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
        updateError: updateErrorAction
      },
      dispatch
    );
  }
)(RightPanel);
