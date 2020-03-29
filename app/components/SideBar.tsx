import React, { PureComponent } from 'react';
import Switch from 'react-switch';
import { remote } from 'electron';

import styles from './SideBar.css';
import Proto from './Proto';

type State = {
  protos: string[];
};

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

export default class SideBar extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      protos: []
    };
  }

  loadProtoFile = async () => {
    const { dialog } = remote;
    const result = await dialog.showOpenDialog({
      properties: ['openFile']
    });
    const { protos } = this.state;
    this.setState({
      protos: [...protos, ...result.filePaths]
    });
  };

  render() {
    const { protos } = this.state;
    const {
      onMessageItemSelect,
      handleProtoEnableToggle,
      isProtoEnabled
    } = this.props;
    return (
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <span>Protos</span>
          <div>
            <Switch
              onChange={handleProtoEnableToggle}
              checked={isProtoEnabled}
            />
            {isProtoEnabled && (
              <button type="button" onClick={this.loadProtoFile}>
                +
              </button>
            )}
          </div>
        </div>
        <div className={styles.list}>
          {protos.map(proto => (
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
