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

    return (
      <div className={styles.wrapper}>
        <span className={styles.packageName}>
          {proto.filepath.split('/').pop()}
        </span>
        {Object.keys(proto.data).map(packageName => {
          return (
            <div key={packageName}>
              <p>{packageName}</p>
              <ul>
                {proto.data[packageName].messages.map(msg => (
                  <li key={msg.name}>
                    <button
                      type="button"
                      onClick={
                        () =>
                          onMessageItemSelect({
                            ...msg,
                            proto: proto.filepath,
                            packageName
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
        })}
      </div>
    );
  }
}
