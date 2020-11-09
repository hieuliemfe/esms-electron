import React from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import routes from '../../constants/routes.json';
import { selectAngryWarningShow } from './angryWarningModalSlice';
import styles from './AngryWarningModal.css';

export default function AngryWarningModal() {
  const location = useLocation();
  const isAngryWarningShow = useSelector(selectAngryWarningShow);

  return location.pathname !== routes.LOGIN ? (
    <div
      className={`${styles.overlay} ${isAngryWarningShow ? styles.show : ''}`}
    >
      <div className={styles.warningWrapper}>
        <div className={styles.warningTitleWrapper}>
          <span className={styles.warningTitle}>BE CAREFUL</span>
        </div>
        <div className={styles.warningMessageWrapper}>
          <span className={styles.warningMessage}>
            Your expression seems like critically negative!
          </span>
        </div>
      </div>
    </div>
  ) : (
    <></>
  );
}
