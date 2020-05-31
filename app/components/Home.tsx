import React, { PureComponent } from 'react';

import styles from './Home.css';
import SideBar from './SideBar';
import RightPanel from './RightPanel';

export default class Home extends PureComponent<void> {
  render() {
    return (
      <div className={styles.container} data-tid="container">
        <div className={styles.homeWrapper}>
          <SideBar />
          <RightPanel />
        </div>
      </div>
    );
  }
}
