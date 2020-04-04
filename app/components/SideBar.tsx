import React, { PureComponent } from 'react';
import Switch from 'react-switch';
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

class SideBar extends PureComponent<Props, State> {
  reloadProtoFile = () => {};

  loadProtoFile = async () => {
    const { dialog } = remote;
    const result = await dialog.showOpenDialog({
      properties: ['openFile']
    });

    const { updateProtoPaths } = this.props;
    updateProtoPaths(result.filePaths);
  };

  handleProtoEnableToggle = (checked: boolean) => {
    const { handleEnableProtoToggleChange } = this.props;

    handleEnableProtoToggleChange(checked);
  };

  render() {
    const { onMessageItemSelect, isProtoEnabled, protoPaths } = this.props;
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
          {protoPaths.map(proto => (
            <Proto
              key={proto}
              path={proto}
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
    protoPaths: state.appCache.paths
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
