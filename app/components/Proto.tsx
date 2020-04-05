import React, { PureComponent } from 'react';
import Protobuf from 'protobufjs';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';

import styles, { message } from './Proto.css';
import { updateProtoMessagesAction } from '../actions/appCache';

type Item = {
  name: string;
  messages: { name: string; fields: any };
};

type State = {};

type Props = {
  path: string;
  onMessageItemSelect: (msg: {
    name: string;
    fields: Record<string, any>;
    proto: string;
    packageName: string;
  }) => void;
};

class Proto extends PureComponent<Props, State> {
  componentDidMount() {
    this.loadProto();
  }

  setItems = (packageName: string, messages: string[]) => {
    const { updateProtoMessages } = this.props;
    updateProtoMessages({ name: packageName, messages });
  };

  findMessages = (tree, packageName?: string) => {
    const subPackages = Object.keys(tree.nested);

    for (let i = 0; i < subPackages.length; i += 1) {
      const subPackageName = subPackages[i];
      if (!tree.nested[subPackageName].nested) {
        const messages = Object.keys(tree.nested);
        this.setItems(
          packageName,
          messages
            .filter(msgName => tree.nested[msgName].fields)
            .map(msgName => ({
              name: msgName,
              fields: tree.nested[msgName].fields
            }))
        );
        break;
      }
      let str = '';
      if (packageName) {
        str = `${packageName}.`;
      }
      this.findMessages(tree.nested[subPackageName], `${str}${subPackageName}`);
    }
  };

  loadProto = async () => {
    const { path } = this.props;
    // eslint-disable-next-line @typescript-eslint/ban-types
    const root: Object = await Protobuf.load(path);

    this.findMessages(root);
  };

  render() {
    const { messages, onMessageItemSelect, path } = this.props;
    if (!messages) {
      return null;
    }
    return messages.map(item => {
      console.log(item);
      return (
        <div className={styles.wrapper} key={item}>
          <span className={styles.packageName}>{item.name}</span>
          <ul>
            {item.messages &&
              item.messages.map(msg => (
                <li key={msg.name}>
                  <button
                    type="button"
                    onClick={
                      () =>
                        onMessageItemSelect({
                          ...msg,
                          proto: path,
                          packageName: item.name
                        })
                      // eslint-disable-next-line react/jsx-curly-newline
                    }
                  >
                    {msg.name}
                  </button>
                </li>
              ))}
          </ul>
        </div>
      );
    });
  }
}

function mapStateToProps(state: counterStateType) {
  return {
    messages: state.appCache.messages
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return bindActionCreators(
    {
      updateProtoMessages: updateProtoMessagesAction
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Proto);
