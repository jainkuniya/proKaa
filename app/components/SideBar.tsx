/* eslint-disable max-classes-per-file */
import React, { PureComponent } from 'react';
import Switch from '@material-ui/core/Switch';
import Protobuf, { Root } from 'protobufjs';
import { remote } from 'electron';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import styles from './SideBar.css';
import Proto from './Proto';

import { toggleEnableProtoAction } from '../actions/appConfig';
import { cleanAction, updateProtoPathsAction } from '../actions/appCache';
import findMessagesInProto from '../parser/parseProto';

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

const decodeProtoFile = async (filePath: string) => {
  try {
    const root: Root = await Protobuf.load(filePath);
    return findMessagesInProto(root);
  } catch (e) {
    const { dialog } = remote;
    dialog.showMessageBox({
      type: 'error',
      buttons: ['Cancel'],
      defaultId: 1,
      cancelId: 0,
      title: 'Error loading proto file',
      message: e.toString()
    });
  }
  return null;
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
      if (data) {
        updatedProtos = [
          ...updatedProtos,
          {
            filepath: result.filePaths[i],
            data
          }
        ];
      }
    }
    if (updatedProtos.length > 0) {
      const { updateProtoPaths } = this.props;
      updateProtoPaths(updatedProtos);
    }
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
