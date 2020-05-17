import React, { PureComponent } from 'react';
import Fab from '@material-ui/core/Fab';
import ClipLoader from 'react-spinners/ClipLoader';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import ReactJson from 'react-json-view';
import { v4 as uuidv4 } from 'uuid';
import { Producer } from 'kafka-node';

import { GlobalState, ProtoFile } from '../reducers/types';
import styles from './Home.css';
import SideBar from './SideBar';
import HostInput from './HostInput';
import generateMockData from '../mock/generateMockData';
import publishMessage from '../kafka/publishMessage';
import { updateKafkaTopicAction } from '../actions/appConfig';

type State = {
  message: {
    type: 'string' | 'object';
    // eslint-disable-next-line @typescript-eslint/ban-types
    content: string | Object;
  };
  loading: boolean;
  error?: string;
  proto?: string;
  packageName?: string;
  messageName?: string;
  producer?: Producer;
};

type Props = {
  isProtoEnabled: boolean;
  protos: ProtoFile[];
  kafkaTopic: string;
  onKafkaTopicChange: (topic: string) => void;
};

class Home extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      message: { type: 'string', content: '' },
      loading: false
    };
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
    const { producer, message, messageName, proto, packageName } = this.state;
    const { kafkaTopic } = this.props;
    const { isProtoEnabled } = this.props;
    publishMessage(
      isProtoEnabled,
      message,
      uuidv4(),
      kafkaTopic,
      error => this.setState({ error }),
      loading => this.setState({ loading }),
      producer,
      messageName,
      proto,
      packageName
    );
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

  render() {
    const { message, loading, error } = this.state;
    const { isProtoEnabled, kafkaTopic } = this.props;
    return (
      <div className={styles.container} data-tid="container">
        <div className={styles.sideBar}>
          <SideBar onMessageItemSelect={this.onMessageItemSelect} />
        </div>
        <div className={styles.rightPanel}>
          <div>
            <HostInput updateProducer={this.updateProducer} />
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
                src={typeof message.content === 'object' ? message.content : {}}
                onEdit={this.onMessageEdit}
                onAdd={this.onMessageEdit}
                onDelete={this.onMessageEdit}
              />
            )}
          </div>
          {error && (
            <div className={styles.errorWrapper}>{JSON.stringify(error)}</div>
          )}
          <Fab
            className={styles.pushButton}
            type="button"
            onClick={this.sendMessage}
            size="large"
            style={{
              margin: 0,
              top: 'auto',
              height: '70px',
              width: '70px',
              right: 20,
              bottom: 20,
              left: 'auto',
              position: 'fixed',
              color: '#fff',
              backgroundColor: '#F50057'
            }}
          >
            {!loading && <span>Push</span>}
            <ClipLoader size={20} color="#ffffff" loading={loading} />
          </Fab>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state: GlobalState) {
  return {
    isProtoEnabled: state.appConfig.protoEnabled,
    protos: state.appCache.protos,
    kafkaTopic: state.appConfig.kafkaTopic
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return bindActionCreators(
    {
      onKafkaTopicChange: updateKafkaTopicAction
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
