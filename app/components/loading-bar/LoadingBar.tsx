import React from 'react';
import { useSelector } from 'react-redux';
import { selectLoading } from './loadingBarSlice';
import styles from './LoadingBar.css';

export default function LoadingBar() {
  const isLoading = useSelector(selectLoading);

  return (
    <div className={`${styles.loadingBar} ${isLoading ? styles.show : ''}`}>
      <div className={styles.line} />
      <div className={`${styles.subline} ${styles.inc}`} />
      <div className={`${styles.subline} ${styles.dec}`} />
    </div>
  );
}
