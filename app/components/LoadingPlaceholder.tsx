import React from 'react';
import path from 'path';
import styles from './LoadingPlaceholder.css';

export default function LoadingPlaceholder(): JSX.Element {
  const logo = path.join(__dirname, '../resources/esms_logo300.png');

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <img src={logo} alt="ESMSLogo" className={styles.logo} />
        <div className={styles.loadingBar}>
          <div className={styles.line} />
          <div className={`${styles.subline} ${styles.inc}`} />
          <div className={`${styles.subline} ${styles.dec}`} />
        </div>
      </div>
    </div>
  );
}
