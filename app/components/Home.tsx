import React, { PureComponent } from 'react';
import Alert from '@material-ui/lab/Alert';
import { connect } from 'react-redux';

import { GlobalState, ProtoFile } from '../reducers/types';
import styles from './Home.css';
import SideBar from './SideBar';
import generateMockData from '../mock/generateMockData';
import ProKaaError from '../ProKaaError';
import RightPanel from './RightPanel';
import { ProKaaMessage } from './types';

type State = {
  selectedMessage: ProKaaMessage;
  error?: ProKaaError;
};

type Props = {
  isProtoEnabled: boolean;
  protos: ProtoFile[];
};

class Home extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selectedMessage: { value: '' }
    };
  }

  onMessageItemSelect = (
    messageName: string,
    fileName: string,
    packageName: string
  ) => {
    this.setState({
      error: undefined
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
        selectedMessage: {
          value: mockValue,
          name: messageName,
          packageName,
          protoPath: fileName
        }
      });
    } catch (e) {
      this.setState({ error: new ProKaaError(e.message) });
    }
  };

  render() {
    const { selectedMessage, error } = this.state;

    return (
      <div className={styles.container} data-tid="container">
        <div className={styles.homeWrapper}>
          <SideBar onMessageItemSelect={this.onMessageItemSelect} />
          <RightPanel message={selectedMessage} />
        </div>
        {error && <Alert severity="error">{error.message}</Alert>}
      </div>
    );
  }
}

export default connect(
  (state: GlobalState) => ({
    isProtoEnabled: state.appConfig.protoEnabled,
    protos: state.appCache.protos
  }),
  null
)(Home);
