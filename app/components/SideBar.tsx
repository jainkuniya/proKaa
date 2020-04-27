import React, {PureComponent} from 'react';
import Switch from '@material-ui/core/Switch';
import Protobuf from 'protobufjs';
import {remote} from 'electron';
import {bindActionCreators, Dispatch} from 'redux';
import {connect} from 'react-redux';
import Button from '@material-ui/core/Button';
import {Drawer} from '@material-ui/core';
import styles from './SideBar.css';
import Proto from './Proto';

import {toggleEnableProtoAction} from '../actions/appConfig';
import {cleanAction, updateProtoPathsAction} from '../actions/appCache';

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
      let nestesMessages = [];
      messages.forEach(k => {
        if (tree.nested[k].nested) {
          const temp = findMessages(tree.nested[k], packageName);
          Object.keys(temp).forEach(it => {
            nestesMessages = [...nestesMessages, ...temp[it].messages];
          });
        }
      });
      return {
        [packageName]: {
          packageName,
          messages: [
            ...nestesMessages,
            ...messages
              .filter(msgName => tree.nested[msgName].fields)
              .map(msgName => ({
                name: msgName,
                fields: tree.nested[msgName].fields
              }))
          ]
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
  console.log(root);
  console.log(JSON.stringify(root));
  return findMessages(root);
};

class SideBar extends PureComponent<Props, State> {
  reloadProtoFile = () => {
  };

  loadProtoFile = async () => {
    const {dialog} = remote;
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

    const {updateProtoPaths} = this.props;
    updateProtoPaths(updatedProtos);
  };

  handleProtoEnableToggle = (checked: boolean) => {
    const {handleEnableProtoToggleChange} = this.props;
    handleEnableProtoToggleChange(checked);
  };

  clean = () => {
    const {cleanAppCacheAction} = this.props;
    cleanAppCacheAction();
  };

  render() {
    const {onMessageItemSelect, isProtoEnabled, protos} = this.props;
    return (
      <Drawer variant="permanent">
        <div className={styles.wrapper}>
          <div className={styles.header}>
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
              <Button
                color="default"
                type="button"

                style={{
                  backgroundColor: "#FFB74D",
                }}
                onClick={this.reloadProtoFile}
              >
                reload
              </Button>
              <Button
                color="inherit"
                type="button"
                onClick={this.clean}
                style={{
                  marginLeft: "2px",
                  marginRight: "2px",
                  backgroundColor: "#FFB74D",
                }}>
                clean
              </Button>

              <Button
                color="default"
                type="button"
                onClick={this.loadProtoFile}
                style={{

                  backgroundColor: "#E91E63",
                }}
              >
                +
              </Button>
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
      </Drawer>
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

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SideBar);
