import React, { PureComponent } from 'react';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import styles from './Proto.css';
import {
  ProtoFile,
  ProtoData,
  ProtoMessage,
  Dispatch
} from '../reducers/types';
import { onSideBarItemSelectAction } from '../actions/appCache';

type Props = {
  proto: ProtoFile;
  onSideBarItemSelect: (
    messageName: string,
    fileName: string,
    packageName: string
  ) => void;
};

class Proto extends PureComponent<Props> {
  renderMessageList = (
    data: ProtoData[] | ProtoMessage[],
    pkgName?: string
  ) => {
    const { proto, onSideBarItemSelect } = this.props;
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
            () => onSideBarItemSelect(proto.filepath, pkgName, item.name)
            // eslint-disable-next-line react/jsx-curly-newline
          }
          onClick={
            () => onSideBarItemSelect(proto.filepath, pkgName, item.name)
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

export default connect(null, (dispatch: Dispatch) => {
  return bindActionCreators(
    {
      onSideBarItemSelect: onSideBarItemSelectAction
    },
    dispatch
  );
})(Proto);
