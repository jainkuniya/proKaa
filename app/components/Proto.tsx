import React, { PureComponent } from 'react';

import styles from './Proto.css';

type Item = {
  name: string;
  messages: { name: string; fields: any };
};

type State = {};

type Props = {
  proto: { filepath: string; messages: Record<string, any>[] };
  onMessageItemSelect: (msg: {
    name: string;
    fields: Record<string, any>;
    proto: string;
    packageName: string;
  }) => void;
};

export default class Proto extends PureComponent<Props, State> {
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
        {Object.keys(proto.data).map(packageName => {
          return (
            <div className={styles.protoDataWrapper} key={packageName}>
              <span className={styles.exapndIcon} />
              <span className={styles.packageName}>{packageName}</span>
              {proto.data[packageName].messages.map((msg, index) => (
                <div
                  tabIndex={index}
                  role="button"
                  key={msg.name}
                  className={styles.message}
                  onKeyPress={
                    () =>
                      onMessageItemSelect({
                        ...msg,
                        proto: proto.filepath,
                        packageName
                      })
                    // eslint-disable-next-line
                  }
                  onClick={
                    () =>
                      onMessageItemSelect({
                        ...msg,
                        proto: proto.filepath,
                        packageName
                      })
                    // eslint-disable-next-line
                  }
                >
                  {msg.name}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  }
}
