/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable promise/always-return */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import path from 'path';
import routes from '../../constants/routes.json';
import { ProfileInfo } from '../../services/root';
import { getSessionSummary, SessionInfo } from '../../services/sessions';
import { selectUserProfile } from '../login/loginSlice';
import styles from './SessionHistoryDetail.css';
import { selectHistoryId } from './sessionSlice';

const twoDigits = (num: number | string) => `${`0${num}`.substr(-2)}`;
const fourDigits = (num: number | string) => `${`000${num}`.substr(-4)}`;

const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${twoDigits(date.getDate())}/${twoDigits(
    date.getMonth() + 1
  )}/${date.getFullYear()} at ${twoDigits(date.getHours())}:${twoDigits(
    date.getMinutes()
  )}`;
};

const emotionLevel = (sessionInfo: SessionInfo) => {
  return 0;
  // (+JSON.parse(sessionInfo.info).emotion_level).toFixed(2);
};

export default function SessionHistoryDetail() {
  const dispatch = useDispatch();
  const profile: ProfileInfo = useSelector(selectUserProfile) as ProfileInfo;
  const historyId = useSelector(selectHistoryId);
  const history = useHistory();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [videoSrc, setVideoSrc] = useState(
    path.join(
      __dirname,
      `../evidences/session_${fourDigits(historyId)}/video.mp4`
    )
  );
  const [sessionList, setSessionList] = useState<SessionInfo[] | null>(null);

  const goBack = () => history.goBack();

  useEffect(() => {}, [page, limit]);

  return (
    <div className={styles.container}>
      <div className={styles.profileWrapper}>
        <div className={styles.avatarWrapper}>
          <img
            className={styles.avatar}
            src={profile.avatarUrl}
            alt="EmployeeAvatar"
          />
        </div>
        <span className={styles.fullname}>{profile.fullname}</span>
        <hr />
        <div className={styles.infoWrapper}>
          <div className={styles.infoLine}>
            <span className={styles.infoName}>
              <u>EmpCode</u>
              {': '}
            </span>
            <span className={styles.infoValue}>{profile.employeeCode}</span>
          </div>
          <div className={styles.infoLine}>
            <span className={styles.infoName}>
              <u>Email</u>
              {': '}
            </span>
            <span className={styles.infoValue}>{profile.email}</span>
          </div>
          <div className={styles.infoLine}>
            <span className={styles.infoName}>
              <u>Phone</u>
              {': '}
            </span>
            <span className={styles.infoValue}>{profile.phoneNumber}</span>
          </div>
          <div className={styles.infoLine}>
            <span className={styles.infoName}>
              <u>Position</u>
              {': '}
            </span>
            <span className={styles.infoValue}>{profile.Role.roleName}</span>
          </div>
        </div>
        <div className={styles.paddingFlex} />
        <div className={styles.btnWrapper}>
          <button
            type="button"
            className={styles.btnAction}
            onClick={() => goBack()}
          >
            Go Back
          </button>
        </div>
      </div>
      <div className={styles.contentWrapper}>
        <h4 className={styles.title}>
          <span>ESMS</span>
          Session History Evidence
        </h4>
        <video width="320" height="240" controls autoPlay>
          <source src={videoSrc} type="video/mp4" />
          No video found
        </video>
      </div>
    </div>
  );
}
