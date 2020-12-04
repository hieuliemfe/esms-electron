import React from 'react';
import styles from './LoadingPlaceholder.css';
import logo from '../assets/esms_logo300.png';

export default function LoadingPlaceholder(): JSX.Element {
  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <img
          src={logo}
          alt="ESMSLogo"
          className={styles.logo}
          draggable={false}
        />
        <div className={styles.loadingBar}>
          <div className={styles.line} />
          <div className={`${styles.subline} ${styles.inc}`} />
          <div className={`${styles.subline} ${styles.dec}`} />
        </div>
      </div>
    </div>
  );
}
