/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable promise/always-return */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import routes from '../../constants/routes.json';
import { selectUserProfile, ProfileInfo } from '../login/loginSlice';
import { getSessionSummary, SessionInfo } from '../../services/sessions';
import { setHistoryId } from './sessionSlice';
import styles from './SessionHistory.css';

const twoDigits = (num: number | string) => `${`0${num}`.substr(-2)}`;

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
  return (+JSON.parse(sessionInfo.info).emotion_level).toFixed(2);
};

export default function SessionHistory() {
  const dispatch = useDispatch();
  const profile: ProfileInfo = useSelector(selectUserProfile) as ProfileInfo;
  const history = useHistory();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sessionList, setSessionList] = useState<SessionInfo[] | null>(null);

  const selectHistory = (hId: number) => {
    console.log('historyId', hId);
    dispatch(setHistoryId(hId));
    history.push(routes.SESSION_HISTORY_DETAIL);
  };

  const goBack = () => history.goBack();

  useEffect(() => {
    getSessionSummary(page, limit)
      .then((sessionSummaryResponse) => {
        if (sessionSummaryResponse.status) {
          const data = sessionSummaryResponse.message;
          setSessionList(data);
        }
      })
      .catch((error) => console.log(error));
  }, [page, limit]);

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
          Session History
        </h4>
        {sessionList && sessionList.length > 0 ? (
          <>
            <div className={styles.sessionHistoryWrapper}>
              {sessionList.map((session: SessionInfo) => (
                <div
                  className={`${styles.sessionCard} ${styles.hover}`}
                  key={session.id}
                  onClick={() => selectHistory(session.id)}
                  onKeyDown={() => selectHistory(session.id)}
                >
                  <div className={styles.sessionHeaderWrapper}>
                    <span className={styles.sessionTitle}>
                      {`SessionNo:${session.id}`}
                    </span>
                    <span className={styles.emotionLevel}>
                      EmotionLevel:
                      {emotionLevel(session)}
                    </span>
                  </div>
                  <div className={styles.sessionFooterWrapper}>
                    <div className={styles.sessionTimeWrapper}>
                      <span className={styles.sessionTime}>
                        Start:
                        {formatDate(session.sessionStart)}
                      </span>
                      <span className={styles.sessionTime}>
                        End:
                        {formatDate(session.sessionEnd)}
                      </span>
                    </div>
                    <span
                      className={`${styles.sessionEvaluate} ${
                        styles[session.status]
                      }`}
                    >
                      {session.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className={styles.sessionHistoryWrapper}>
            <div className={styles.sessionCard}>
              <span className={`${styles.sessionTitle} ${styles.noSession}`}>
                NO SESSION AVAILABLE
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
