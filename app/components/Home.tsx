import React, { PureComponent } from 'react';
import Fab from '@material-ui/core/Fab';
import ClipLoader from 'react-spinners/ClipLoader';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import ReactJson from 'react-json-view';
import Protobuf from 'protobufjs';
import { v4 as uuidv4 } from 'uuid';

import { Producer } from 'kafka-node';
import styles from './Home.css';
import SideBar from './SideBar';
import HostInput from './HostInput';
import generateMockData from '../mock/generateMockData';

type State = {
  message: { type: 'string' | 'object'; content: string | Record<string, any> };
  topic: string;
  loading: boolean;
  error?: string;
  proto?: string;
  packageName?: string;
  messageName?: string;
  producer?: Producer;
};

type Props = { isProtoEnabled: boolean };

class Home extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      message: { type: 'string', content: '' },
      topic: 'topic123',
      loading: false
    };
  }

  updateProducer = (newProducer: Producer, error) => {
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

  onMessageEdit = edit => {
    this.setState({
      message: { type: 'object', content: edit.updated_src }
    });
  };

  handleTopicChange = (host: { target: { value: string } }) => {
    this.setState({
      topic: host.target.value
    });
  };

  sendMessage = async () => {
    const { producer } = this.state;
    if (!producer) {
      this.setState({
        error: 'please connect to the producer'
      });

      return;
    }
    const { isProtoEnabled } = this.props;
    this.setState({
      error: ''
    });
    const { message, messageName, topic, proto, packageName } = this.state;
    let payloads;
    if (!isProtoEnabled) {
      payloads = [{ topic, messages: message.content }];
    } else {
      const root: Record<string, any> = await Protobuf.load(proto);
      const protoMessage = root.lookupType(`${packageName}.${messageName}`);
      const errMsg = protoMessage.verify(message.content);
      if (errMsg) {
        console.error(errMsg);
        this.setState({
          error: errMsg
        });
        return;
      }
      const msg = protoMessage.create(message.content);
      const buffer = protoMessage.encode(msg).finish();
      // console.log(buffer, protoMessage.decode(buffer));
      payloads = [{ topic, messages: buffer, key: uuidv4() }];
    }
    this.setState({
      loading: true
    });

    producer.send(payloads, (err, data) => {
      this.setState({
        loading: false
      });
      console.log(err, data);
    });
  };

  onMessageItemSelect = (msg: {
    name: string;
    fileName: string;
    packageName: string;
  }) => {
    this.setState({
      error: ''
    });

    const { protos } = this.props;
    Object.keys(protos).forEach(item => {
      if (protos[item].filepath === msg.fileName) {
        const mockValue = generateMockData(
          msg.name,
          msg.packageName,
          protos[item].data
        );
        this.setState({
          message: { type: 'object', content: mockValue },
          messageName: msg.name,
          proto: msg.fileName,
          packageName: msg.packageName
        });
      }
    });
  };

  render() {
    const { message, topic, loading, error } = this.state;
    const { isProtoEnabled } = this.props;
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
                value={topic}
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
                value={message.content}
                onChange={this.handleMessageChange}
              />
            ) : (
              <ReactJson
                theme="summerfruit:inverted"
                name={false}
                displayDataTypes={false}
                displayObjectSize={false}
                enableClipboard={false}
                src={{ ...message.content }}
                onEdit={this.onMessageEdit}
                onAdd={this.onMessageEdit}
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

function mapStateToProps(state) {
  return {
    isProtoEnabled: state.appConfig.protoEnabled,
    protos: state.appCache.protos
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return bindActionCreators({}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
