import React, { PureComponent } from 'react';
import Alert from '@material-ui/lab/Alert';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';

import {
  GlobalState,
  ProtoFile,
  ProKaaKafkaClientState
} from '../reducers/types';
import styles from './Home.css';

import {
  updateKafkaTopicAction,
  updateKafkaHostAction
} from '../actions/appConfig';
import { toggleIsConsumerConnectingAction } from '../actions/appCache';
import InputField from './InputField';
import ProkaaKafkaClient from '../kafka/ProkaaKafkaClient';
import ProKaaError from '../ProKaaError';
import RightPanelBody from './RightPanelBody';

type State = {
  kafkaClientState: ProKaaKafkaClientState;
  prokaaKafkaClient?: ProkaaKafkaClient;
  error?: ProKaaError;
};

type Props = {
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
    const { error, kafkaClientState, prokaaKafkaClient } = this.state;
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
        {error && <Alert severity="error">{error.message}</Alert>}
      </div>
    );
  }
}

export default connect(
  (state: GlobalState) => {
    return {
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
        toggleIsConsumerConnecting: toggleIsConsumerConnectingAction
      },
      dispatch
    );
  }
)(RightPanel);
