import React, { PureComponent } from 'react';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import kafka from 'kafka-node';
import ClipLoader from 'react-spinners/ClipLoader';

import styles from './Home.css';
import { updateKafkaHostAction } from '../actions/appConfig';
import {Button} from "@material-ui/core";

type State = {
  loading: boolean;
  buttonText: string;
};

type Props = {
  kafkaHost: string;
  updateProducer: (
    producer?: Record<string, any>,
    error?: Record<string, any>
  ) => void;
  updateKafkaHost: (kafkaHost: string) => void;
};

class HostInput extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      buttonText: 'Connect'
    };
  }

  componentDidMount() {
    this.createProducer();
  }

  createProducer = () => {
    const { kafkaHost } = this.props;
    const { Producer } = kafka;
    const { updateProducer } = this.props;
    updateProducer(undefined, undefined);
    this.setState({
      loading: true
    });
    try {
      const client = new kafka.KafkaClient({
        kafkaHost
      });
      const producer = new Producer(client);

      producer.on('ready', () => {
        updateProducer(producer, undefined);
        this.setState({
          loading: false,
          buttonText: 'Connected'
        });
      });

      producer.on('error', err => {
        updateProducer(producer, err);
        this.setState({
          loading: false,
          buttonText: 'Connect'
        });
      });
    } catch (error) {
      updateProducer(undefined, 'Exception while creating producer');
      this.setState({
        loading: false,
        buttonText: 'Connect'
      });
    }
  };

  handleHostChange = (event: { target: { value: string }; key: string }) => {
    const { updateKafkaHost } = this.props;
    updateKafkaHost(event.target.value);
  };

  render() {
    const { loading, buttonText } = this.state;
    const { kafkaHost } = this.props;
    return (
      <span className={styles.inputRow}>
        <span className={styles.label}>Kafka Host:</span>
        <input
          value={kafkaHost}
          className={styles.input}
          placeholder="localhost:9092"
          onChange={e => {
            this.handleHostChange(e);
          }}
          disabled={loading}
        />
        <Button
          className={styles.connectButton}
          type="button"
          onClick={this.createProducer}
          style={{
            backgroundColor: "#E91E63",
            color:"#fff",
            marginLeft: "2px",
          }}
          disabled={loading}
        >
          {!loading && <span>{buttonText}</span>}
          <ClipLoader size={20} color="#ffffff" loading={loading} />
        </Button>
      </span>
    );
  }
}

function mapStateToProps(state) {
  return {
    kafkaHost: state.appConfig.kafkaHost
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return bindActionCreators(
    { updateKafkaHost: updateKafkaHostAction },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(HostInput);
