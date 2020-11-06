/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable promise/always-return */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { ipcRenderer } from 'electron';
import routes from '../../constants/routes.json';
import { getShifts, checkinShift, ShiftInfo } from '../../services/shifts';
import {
  selectUserProfile,
  setToken,
  setCounterId,
  setShiftId,
  ProfileInfo,
} from '../login/loginSlice';
import { setToken as setRequestToken } from '../../utils/request';
import styles from './Checkin.css';

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

export default function Checkin() {
  const dispatch = useDispatch();
  const profile: ProfileInfo = useSelector(selectUserProfile) as ProfileInfo;
  const history = useHistory();
  const [activeShift, setActiveShift] = useState<ShiftInfo | null>(null);
  const [shiftList, setShiftList] = useState<ShiftInfo[] | null>(null);

  const viewSessionHistory = () => history.push(routes.SESSION_HISTORY);

  const checkin = (shiftId: number) => {
    if (activeShift) {
      const { counterId } = activeShift;
      checkinShift(shiftId)
        .then(() => {
          dispatch(setCounterId(counterId));
          dispatch(setShiftId(shiftId));
          history.push(routes.WAITING_LIST);
        })
        .catch((error) => console.log(error));
    }
  };

  const logout = () => {
    setRequestToken(null);
    dispatch(setToken(''));
    ipcRenderer.send('logout');
    history.push('/');
  };

  useEffect(() => {
    if (!activeShift) {
      getShifts()
        .then((shiftResponse) => {
          if (shiftResponse.status) {
            const data = shiftResponse.message;
            const actvShift = data.pop();
            if (actvShift) {
              setActiveShift(actvShift);
              setShiftList(data);
            }
          }
        })
        .catch((error) => console.log(error));
    }
  }, [activeShift]);

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
            onClick={() => logout()}
          >
            Logout
          </button>
        </div>
      </div>
      <div className={styles.contentWrapper}>
        <h4 className={styles.title}>
          <span>ESMS</span>
          Checkin
        </h4>
        <h5 className={styles.totitle}>To Checkin:</h5>
        {activeShift ? (
          <div className={styles.shiftListWrapper}>
            <div
              className={`${styles.shiftCard} ${styles.hover}`}
              key={activeShift.id}
            >
              <div className={styles.shiftTitleWrapper}>
                <span className={styles.shiftTitle}>
                  {`SHIFT NO.${`000${activeShift.id}`.substr(-4)}`}
                </span>
                <div>
                  <button type="button" onClick={() => checkin(activeShift.id)}>
                    Checkin
                  </button>
                </div>
              </div>
              <div className={styles.shiftTimeWrapper}>
                <span className={styles.shiftTime}>
                  Start:
                  {formatDate(activeShift.shiftStart)}
                </span>
                <span className={styles.shiftTime}>
                  End:
                  {formatDate(activeShift.shiftEnd)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.shiftListWrapper}>
            <div className={styles.shiftCard}>
              <span className={`${styles.shiftTitle} ${styles.noShift}`}>
                NO SHIFT AVAILABLE TO CHECKIN
              </span>
            </div>
          </div>
        )}
        {activeShift && shiftList && shiftList.length > 0 && (
          <>
            <h5 className={styles.totitle}>Upcoming:</h5>
            <div className={styles.shiftListWrapper}>
              {shiftList.map((shift: ShiftInfo) => (
                <div className={styles.shiftCard} key={shift.id}>
                  <span className={styles.shiftTitle}>
                    {`SHIFT NO.${`000${shift.id}`.substr(-4)}`}
                  </span>
                  <div className={styles.shiftTimeWrapper}>
                    <span className={styles.shiftTime}>
                      Start:
                      {formatDate(shift.shiftStart)}
                    </span>
                    <span className={styles.shiftTime}>
                      End:
                      {formatDate(shift.shiftEnd)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
