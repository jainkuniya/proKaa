import React, { PureComponent, ChangeEvent } from 'react';
import Fab from '@material-ui/core/Fab';
import ClipLoader from 'react-spinners/ClipLoader';
import { Button } from '@material-ui/core';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import ReactJson from 'react-json-view';
import { v4 as uuidv4 } from 'uuid';
import { Producer } from 'kafka-node';

import { GlobalState, ProtoFile } from '../reducers/types';
import styles from './Home.css';
import SideBar from './SideBar';

import generateMockData from '../mock/generateMockData';
import publishMessage from '../kafka/publishMessage';
import {
  updateKafkaTopicAction,
  updateKafkaHostAction
} from '../actions/appConfig';
import ConsumerPanel from './ConsumerPanel';
import ProkaaKafkaClient from '../kafka/ProkaaKafkaClient';

type State = {
  message: {
    type: 'string' | 'object';
    // eslint-disable-next-line @typescript-eslint/ban-types
    content: string | Object;
  };
  kafkaHost: string;
  isLoading: boolean;
  isSendMsgLoading: boolean;
  isConnected: boolean;
  error?: string;
  proto?: string;
  packageName?: string;
  messageName?: string;
  producer?: Producer;
};

type Props = {
  kafkaHost: string;
  isProtoEnabled: boolean;
  protos: ProtoFile[];
  kafkaTopic: string;
  onKafkaTopicChange: (topic: string) => void;
  onKafkaHostChange: (kafkaHost: string) => void;
};

class Home extends PureComponent<Props, State> {
  prokaaKafkaClient?: ProkaaKafkaClient;

  constructor(props: Props) {
    super(props);

    this.state = {
      kafkaHost: props.kafkaHost,
      message: { type: 'string', content: '' },
      isLoading: false,
      isSendMsgLoading: false,
      isConnected: false
    };
  }

  componentDidMount() {
    this.connectKafka();
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
      message: { type: 'string', content: event.target.value }
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onMessageEdit = (edit: { updated_src: any }) => {
    this.setState({
      message: { type: 'object', content: edit.updated_src }
    });
  };

  handleTopicChange = (host: { target: { value: string } }) => {
    const { onKafkaTopicChange } = this.props;
    onKafkaTopicChange(host.target.value);
  };

  sendMessage = async () => {
    if (!this.prokaaKafkaClient) {
      this.onError('please connect to the kafka');
      return;
    }

    const { message, messageName, proto, packageName } = this.state;
    const { kafkaTopic } = this.props;
    publishMessage(
      this.prokaaKafkaClient,
      message.content,
      uuidv4(),
      kafkaTopic,
      error => this.setState({ error }),
      this.toggleSendMsgLoading,
      messageName,
      proto,
      packageName
    );
  };

  onError = (error: string) => {
    this.setState({
      error
    });
  };

  toggleLoading = (isLoading: boolean) => {
    this.setState({
      isLoading
    });
  };

  toggleSendMsgLoading = (isSendMsgLoading: boolean) => {
    this.setState({
      isSendMsgLoading
    });
  };

  toggleConnected = (isConnected: boolean) => {
    this.setState({
      isConnected
    });
  };

  onMessageItemSelect = (
    messageName: string,
    fileName: string,
    packageName: string
  ) => {
    this.setState({
      error: ''
    });

    const { protos } = this.props;
    const protoFile = protos.find(proto => proto.filepath === fileName);
    if (!protoFile) {
      return;
    }

    try {
      const mockValue = generateMockData(
        messageName,
        packageName,
        protoFile.data,
        packageName
      );

      this.setState({
        message: { type: 'object', content: mockValue },
        messageName,
        proto: fileName,
        packageName
      });
    } catch (e) {
      this.setState({ error: e.message });
    }
  };

  handleKafkaHostChange = (event: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      kafkaHost: event.target.value
    });
    this.toggleConnected(false);
  };

  connectKafka = () => {
    const { onKafkaHostChange } = this.props;
    const { kafkaHost } = this.state;
    this.prokaaKafkaClient = new ProkaaKafkaClient(kafkaHost);

    this.toggleLoading(true);
    this.toggleConnected(false);

    this.prokaaKafkaClient
      ?.connectProducer()
      .then(
        () => {
          this.toggleConnected(true);
          this.onError('');
          onKafkaHostChange(kafkaHost);
        },
        e => {
          this.toggleConnected(false);
          this.onError(e);
        }
      )
      .catch(e => {
        this.toggleConnected(false);
        this.onError(e);
      })
      .finally(() => this.toggleLoading(false));
  };

  render() {
    const {
      kafkaHost,
      message,
      isLoading,
      isConnected,
      error,
      messageName,
      proto,
      packageName,
      isSendMsgLoading
    } = this.state;
    const { isProtoEnabled, kafkaTopic } = this.props;
    return (
      <div className={styles.container} data-tid="container">
        <div className={styles.sideBar}>
          <SideBar onMessageItemSelect={this.onMessageItemSelect} />
        </div>
        <div className={styles.rightPanel}>
          <div>
            <span className={styles.inputRow}>
              <span className={styles.label}>Kafka Host:</span>
              <input
                value={kafkaHost}
                className={styles.input}
                placeholder={kafkaHost}
                onChange={e => {
                  this.handleKafkaHostChange(e);
                }}
                disabled={isLoading}
              />
              <Button
                className={styles.connectButton}
                type="button"
                onClick={this.connectKafka}
                style={{
                  backgroundColor: '#E91E63',
                  color: '#fff',
                  marginLeft: '2px'
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ClipLoader size={20} color="#ffffff" loading={isLoading} />
                ) : (
                  <span>{isConnected ? 'Connected' : 'connect'}</span>
                )}
              </Button>
            </span>
            <span className={styles.inputRow}>
              <span className={styles.label}>Topic:</span>
              <input
                value={kafkaTopic}
                className={styles.topicInput}
                placeholder="topic"
                onChange={e => {
                  this.handleTopicChange(e);
                }}
              />
            </span>
          </div>
          <div className={styles.body}>
            <div className={styles.messageContainer}>
              {!isProtoEnabled ? (
                <textarea
                  className={styles.messageInput}
                  placeholder="start typing here 😃"
                  value={
                    // just to make type happy
                    typeof message.content === 'string' ? message.content : ''
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
                  src={
                    typeof message.content === 'object' ? message.content : {}
                  }
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
                msgName={messageName}
                protoFile={proto}
                pkgName={packageName}
                onError={this.onError}
              />
            </div>
          </div>
          {error && (
            <div className={styles.errorWrapper}>{JSON.stringify(error)}</div>
          )}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state: GlobalState) {
  return {
    kafkaHost: state.appConfig.kafkaHost,
    isProtoEnabled: state.appConfig.protoEnabled,
    protos: state.appCache.protos,
    kafkaTopic: state.appConfig.kafkaTopic
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return bindActionCreators(
    {
      onKafkaTopicChange: updateKafkaTopicAction,
      onKafkaHostChange: updateKafkaHostAction
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
