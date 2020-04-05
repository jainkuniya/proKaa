import React, { PureComponent } from 'react';
import Switch from 'react-switch';
import Protobuf from 'protobufjs';
import { remote } from 'electron';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';

import styles from './SideBar.css';
import Proto from './Proto';
import { toggleEnableProtoAction } from '../actions/appConfig';
import { updateProtoPathsAction } from '../actions/appCache';

type Props = {
  isProtoEnabled: boolean;
  handleProtoEnableToggle: (enabled: boolean) => void;
  onMessageItemSelect: (msg: {
    name: string;
    fields: Record<string, any>;
    proto: string;
    packageName: string;
  }) => void;
};

const findMessages = (tree, packageName?: string) => {
  const subPackages = Object.keys(tree.nested);
  let data = {};
  for (let i = 0; i < subPackages.length; i += 1) {
    const subPackageName = subPackages[i];
    if (!tree.nested[subPackageName].nested) {
      const messages = Object.keys(tree.nested);
      return {
        [packageName]: {
          packageName,
          messages: messages
            .filter(msgName => tree.nested[msgName].fields)
            .map(msgName => ({
              name: msgName,
              fields: tree.nested[msgName].fields
            }))
        }
      };
    }
    let str = '';
    if (packageName) {
      str = `${packageName}.`;
    }
    data = {
      ...data,
      ...findMessages(tree.nested[subPackageName], `${str}${subPackageName}`)
    };
  }
  return data;
};

const decodeProtoFile = async (path: string) => {
  const root: Record<string, any> = await Protobuf.load(path);
  return findMessages(root);
};

class SideBar extends PureComponent<Props, State> {
  reloadProtoFile = () => {};

  loadProtoFile = async () => {
    const { dialog } = remote;
    const result = await dialog.showOpenDialog({
      properties: ['openFile']
    });

    let updatedProtos = [];
    for (let i = 0; i < result.filePaths.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const data = await decodeProtoFile(result.filePaths[i]);
      updatedProtos = [
        ...updatedProtos,
        {
          filepath: result.filePaths[i],
          data
        }
      ];
    }

    const { updateProtoPaths } = this.props;
    updateProtoPaths(updatedProtos);
  };

  handleProtoEnableToggle = (checked: boolean) => {
    const { handleEnableProtoToggleChange } = this.props;

    handleEnableProtoToggleChange(checked);
  };

  render() {
    const { onMessageItemSelect, isProtoEnabled, protos } = this.props;
    return (
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <span>Protos Messages</span>
          <div className={styles.headerRightPanel}>
            <Switch
              onChange={this.handleProtoEnableToggle}
              checked={isProtoEnabled}
            />
          </div>
        </div>
        {isProtoEnabled && (
          <div className={styles.optionsPanel}>
            <button
              className={styles.options}
              type="button"
              onClick={this.reloadProtoFile}
            >
              reload
            </button>
            <button
              className={styles.options}
              type="button"
              onClick={this.loadProtoFile}
            >
              +
            </button>
          </div>
        )}
        <div className={styles.list}>
          {Object.keys(protos).map(id => (
            <Proto
              key={id}
              proto={protos[id]}
              onMessageItemSelect={onMessageItemSelect}
            />
          ))}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state: counterStateType) {
  return {
    isProtoEnabled: state.appConfig.protoEnabled,
    protos: state.appCache.protos
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return bindActionCreators(
    {
      handleEnableProtoToggleChange: toggleEnableProtoAction,
      updateProtoPaths: updateProtoPathsAction
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(SideBar);
