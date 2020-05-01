/* eslint-disable max-classes-per-file */
import React, { PureComponent } from 'react';
import Switch from '@material-ui/core/Switch';
import Protobuf, { Root, Namespace, Type, Enum } from 'protobufjs';
import { remote } from 'electron';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import styles from './SideBar.css';
import Proto from './Proto';

import { toggleEnableProtoAction } from '../actions/appConfig';
import { cleanAction, updateProtoPathsAction } from '../actions/appCache';

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

const findMessagesV2 = (tree: Root | Protobuf.ReflectionObject) => {
  if (tree instanceof Root) {
    let packages = [];
    Object.keys(tree.nestedArray).forEach((index: string) => {
      packages = [
        ...packages,
        ...findMessagesV2(tree.nestedArray[parseInt(index, 10)])
      ];
    });
    return packages;
  }
  if (tree instanceof Type) {
    let messages = [];
    // look for nested messages
    Object.keys(tree.nestedArray).forEach((index: string) => {
      messages = [
        ...messages,
        ...findMessagesV2(tree.nestedArray[parseInt(index, 10)])
      ];
    });
    return [...messages, { name: tree.name, fields: tree.fields }];
  }
  if (tree instanceof Namespace) {
    let messages = [];
    Object.keys(tree.nestedArray).forEach((index: string) => {
      const newLocal = findMessagesV2(tree.nestedArray[parseInt(index, 10)]);
      messages = [...messages, ...newLocal];
    });
    return [{ packageName: tree.name, messages }];
  }
  if (tree instanceof Enum) {
    return [{ name: tree.name, valuesById: tree.valuesById }];
  }
  return null;
};

const decodeProtoFile = async (path: string) => {
  const root: Root = await Protobuf.load(path);
  return findMessagesV2(root);
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

  handleProtoEnableToggle = (event: { target: { checked: boolean } }) => {
    const { handleEnableProtoToggleChange } = this.props;
    handleEnableProtoToggleChange(event.target.checked);
  };

  clean = () => {
    const { cleanAppCacheAction } = this.props;
    cleanAppCacheAction();
  };

  render() {
    const { onMessageItemSelect, isProtoEnabled, protos } = this.props;
    return (
      <div>
        <div className={styles.wrapper}>
          <div className={styles.header}>
            <div className={styles.headerTextWrapper}>
              <span>Proto Messages</span>
              <div className={styles.headerRightPanel}>
                <Switch
                  onChange={this.handleProtoEnableToggle}
                  checked={isProtoEnabled}
                />
              </div>
            </div>
            {isProtoEnabled && (
              <div className={styles.optionsPanel}>
                {/* <Button
                  color="default"
                  type="button"
                  style={{
                    backgroundColor: '#FFB74D'
                  }}
                  onClick={this.reloadProtoFile}
                >
                  reload
                </Button> */}
                <Button
                  color="inherit"
                  type="button"
                  onClick={this.clean}
                  style={{
                    marginLeft: '2px',
                    marginRight: '2px',
                    backgroundColor: '#FFB74D'
                  }}
                >
                  clean
                </Button>

                <Button
                  color="default"
                  type="button"
                  onClick={this.loadProtoFile}
                  style={{
                    color: '#fff',
                    backgroundColor: '#E91E63'
                  }}
                >
                  +
                </Button>
              </div>
            )}
          </div>
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
      updateProtoPaths: updateProtoPathsAction,
      cleanAppCacheAction: cleanAction
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(SideBar);
