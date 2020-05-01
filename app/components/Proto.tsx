import React, { PureComponent } from 'react';

import styles, { packageName } from './Proto.css';

type Item = {
  name: string;
  messages: { name: string; fields: any };
};

type State = {};

type Props = {
  proto: { filepath: string; messages: Record<string, any>[] };
  onMessageItemSelect: (msg: {
    name: string;
    fileName: string;
    packageName: string;
  }) => void;
};

export default class Proto extends PureComponent<Props, State> {
  renderMessageList = (data, pkgName?: string) => {
    const { proto, onMessageItemSelect } = this.props;
    // console.log(data);
    return data.map(item => {
      if (item.valuesById) {
        // enum
        return null;
      }
      if (item.packageName) {
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
      return (
        <div
          tabIndex={item.name}
          role="button"
          key={item.name}
          className={styles.message}
          onKeyPress={
            () =>
              onMessageItemSelect({
                name: item.name,
                fileName: proto.filepath,
                packageName: pkgName
              })
            // eslint-disable-next-line
                }
          onClick={
            () =>
              onMessageItemSelect({
                name: item.name,
                fileName: proto.filepath,
                packageName: pkgName
              })
            // eslint-disable-next-line
                }
        >
          {item.name}
        </div>
      );
    });
  };

  render() {
    const { proto, onMessageItemSelect } = this.props;

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
