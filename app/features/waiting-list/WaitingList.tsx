/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable promise/always-return */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { ipcRenderer } from 'electron';
import routes from '../../constants/routes.json';
import { checkoutShift } from '../../services/shifts';
import { getQueues, assignQueue, QueueInfo } from '../../services/queues';
import { createSession } from '../../services/sessions';
import {
  selectUserProfile,
  selectCounterId,
  selectShiftId,
  setToken,
  setCounterId,
  setShiftId,
  ProfileInfo,
} from '../login/loginSlice';
import { setSessionId } from '../session/sessionSlice';
import { setToken as setRequestToken } from '../../utils/request';
import styles from './WaitingList.css';

const fourDigits = (num: number | string) => `${`000${num}`.substr(-4)}`;

export default function WaitingList() {
  const dispatch = useDispatch();
  const profile: ProfileInfo = useSelector(selectUserProfile) as ProfileInfo;
  const shiftId = useSelector(selectShiftId);
  const counterId = useSelector(selectCounterId);
  const history = useHistory();
  const [queueList, setQueueList] = useState<QueueInfo[] | null>(null);

  const startSession = (queueId: number) => {
    assignQueue(counterId, queueId)
      .then(async (assignResponse) => {
        if (assignResponse.success) {
          const createSessionResponse = await createSession();
          if (createSessionResponse.success) {
            const shiftInfo = createSessionResponse.message;
            dispatch(setSessionId(shiftInfo.id));
            history.push(routes.SESSION);
          }
        }
      })
      .catch((error) => console.log(error));
  };

  const viewSessionHistory = () => history.push(routes.SESSION_HISTORY);

  const checkout = () => {
    checkoutShift(shiftId)
      .then(() => {
        dispatch(setCounterId(0));
        dispatch(setShiftId(0));
        history.push(routes.CHECKIN);
      })
      .catch((error) => console.log(error));
  };

  const logout = () => {
    setRequestToken(null);
    dispatch(setToken(''));
    ipcRenderer.send('logout');
    history.push('/');
  };

  useEffect(() => {
    console.log('call get queues');
    getQueues()
      .then((queueResponse) => {
        if (queueResponse.success) {
          const data = queueResponse.message;
          setQueueList(data);
        }
      })
      .catch((error) => console.log(error));
  }, [profile]);

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
            onClick={() => viewSessionHistory()}
          >
            View Session History
          </button>
          <button
            type="button"
            className={styles.btnAction}
            onClick={() => checkout()}
          >
            Checkout Shift
          </button>
          <button
            type="button"
            className={styles.btnAction}
            onClick={() => logout()}
          >
            Logout
          </button>
        </div>
      </div>
      <div className={styles.contentWrapper}>
        <h4 className={styles.title}>
          <span>ESMS</span>
          Customer Waiting List
        </h4>
        {queueList && queueList.length > 0 ? (
          <>
            <div className={styles.shiftListWrapper}>
              {queueList.map((queue: QueueInfo) => (
                <div
                  className={`${styles.shiftCard} ${styles.hover}`}
                  key={queue.id}
                >
                  <div className={styles.shiftTitleWrapper}>
                    <span className={styles.shiftTitle}>
                      {`NO.${fourDigits(queue.number)}`}
                    </span>
                    <div>
                      <button
                        type="button"
                        onClick={() => startSession(queue.id)}
                      >
                        Start Session
                      </button>
                    </div>
                  </div>
                  <div className={styles.shiftTimeWrapper}>
                    <div className={styles.paddingFlex} />
                    <span className={styles.shiftTime}>
                      {queue.Category.categoryName}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className={styles.shiftListWrapper}>
            <div className={styles.shiftCard}>
              <span className={`${styles.shiftTitle} ${styles.noShift}`}>
                CURRENTLY NO CUSTOMER IN WAITING LIST
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
