import React, { PureComponent } from 'react';

import styles from './Proto.css';
import { ProtoFile, ProtoData, ProtoMessage } from '../reducers/types';

type Props = {
  proto: ProtoFile;
  onMessageItemSelect: (
    messageName: string,
    fileName: string,
    packageName: string
  ) => void;
};

export default class Proto extends PureComponent<Props> {
  renderMessageList = (
    data: ProtoData[] | ProtoMessage[],
    pkgName?: string
  ) => {
    const { proto, onMessageItemSelect } = this.props;
    return data.map(item => {
      if (item.packageName && !item.name) {
        return (
          <div className={styles.protoDataWrapper} key={item.packageName}>
            <span className={styles.exapndIcon} />
            <span className={styles.packageName}>{item.packageName}</span>
            {this.renderMessageList(
              item.messages,
              `${pkgName}.${item.packageName}`
            )}
          </div>
        );
      }

      if (Object.keys(item.fields).length === 0) {
        return null;
      }
      return (
        <div
          tabIndex={item.name}
          role="button"
          key={`${proto.filepath}.${pkgName}.${item.name}`}
          className={styles.message}
          onKeyPress={
            () => onMessageItemSelect(item.name, proto.filepath, pkgName)
            // eslint-disable-next-line react/jsx-curly-newline
          }
          onClick={
            () => onMessageItemSelect(item.name, proto.filepath, pkgName)
            // eslint-disable-next-line react/jsx-curly-newline
          }
        >
          {item.name}
        </div>
      );
    });
  };

  render() {
    const { proto } = this.props;

    const filePath = proto.filepath.split('/');
    const fileName = filePath.pop();

    return (
      <div className={styles.wrapper}>
        <div className={styles.fileDetailsWrapper}>
          <span className={styles.exapndIcon} />
          <span className={styles.fileName}>{fileName}</span>
        </div>
        {this.renderMessageList(proto.data, '')}
      </div>
    );
  }
}
