/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable promise/always-return */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { ipcRenderer } from 'electron';
import routes from '../../constants/routes.json';
import {
  getShifts,
  getActiveShift,
  checkinShift,
  ShiftInfo,
} from '../../services/shifts';
import {
  selectUserProfile,
  setToken,
  setCounterId,
  setShiftId,
  ProfileInfo,
} from '../login/loginSlice';
import { setToken as setRequestToken } from '../../utils/request';
import styles from './Home.css';

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

export default function Home() {
  const dispatch = useDispatch();
  const profile: ProfileInfo = useSelector(selectUserProfile) as ProfileInfo;
  const history = useHistory();
  const [isShowShiftList, setShowShiftList] = useState(true);
  const [shiftList, setShiftList] = useState<ShiftInfo[] | null>(null);

  const viewSessionHistory = () => history.push(routes.SESSION_HISTORY);

  const checkin = (activeShift: ShiftInfo) => {
    if (activeShift) {
      const { counterId, id: shiftId } = activeShift;
      checkinShift(shiftId)
        .then(() => {
          dispatch(setCounterId(counterId));
          dispatch(setShiftId(shiftId));
        })
        .catch((error) => console.log(error));
    }
  };

  const toggleShowShiftList = () => {
    setShowShiftList(!isShowShiftList);
  };

  const logout = () => {
    setRequestToken(null);
    dispatch(setToken(''));
    ipcRenderer.send('logout');
    history.push('/');
  };

  useEffect(() => {
    getActiveShift()
      .then((activeShiftResponse) => {
        if (activeShiftResponse.status) {
          const activeShifts = activeShiftResponse.message;
          if (activeShifts && activeShifts.length > 0) {
            const activeShift = activeShifts[0];
            checkin(activeShift);
          }
        }
      })
      .catch((error) => console.log(error));
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.sideBar}>
        <span className={styles.appName}>EsmsApp</span>
        <div className={styles.navigation}>
          <div
            className={`${styles.btnNav} ${styles.active} ${styles.noPointer}`}
          >
            <div className={styles.iconBox}>
              <i className="fa fa-home" />
            </div>
            <span className={styles.btnText}>Home</span>
          </div>
          <div
            className={`${styles.btnNav} ${
              isShowShiftList ? styles.active : ''
            }`}
            onClick={() => toggleShowShiftList()}
          >
            <div className={styles.iconBox}>
              <i className="far fa-calendar-alt" />
            </div>
            <span className={styles.btnText}>Shifts</span>
          </div>
          <div className={styles.btnNav} onClick={() => logout()}>
            <div className={styles.iconBox}>
              <i className="fa fa-sign-out-alt" />
            </div>
            <span className={styles.btnText}>Logout</span>
          </div>
          <div className={styles.paddingFlex} />
          <div className={styles.avatarNav}>
            <div className={styles.avatarBox}>
              <img
                className={styles.avatar}
                src={profile.avatarUrl}
                alt="EmployeeAvatar"
              />
            </div>
            <span className={styles.avatarText}>{profile.fullname}</span>
          </div>
        </div>
      </div>
      <div
        className={`${styles.shiftListWrapper} ${
          isShowShiftList ? styles.show : ''
        }`}
      >
        <div className={styles.shiftListInner}>
          <span className={styles.shiftListTitle}>Today shifts</span>
          <div className={styles.shiftList}>
            <div className={`${styles.shiftItem} ${styles.unavailable}`}>
              <div className={styles.shiftHead}>
                <i className="far fa-clock" />
                <span className={styles.shiftName}>Shift S01</span>
              </div>
              <div className={styles.shiftTail}>
                <span className={styles.startTime}>00:00 AM</span>
                <span className={styles.endTime}>04:00 AM</span>
              </div>
            </div>
            <div className={`${styles.shiftItem} ${styles.unavailable}`}>
              <div className={styles.shiftHead}>
                <i className="far fa-clock" />
                <span className={styles.shiftName}>Shift S02</span>
              </div>
              <div className={styles.shiftTail}>
                <span className={styles.startTime}>04:00 AM</span>
                <span className={styles.endTime}>08:00 AM</span>
              </div>
            </div>
            <div className={`${styles.shiftItem} ${styles.active}`}>
              <div className={styles.shiftHead}>
                <i className="far fa-clock" />
                <span className={styles.shiftName}>Shift S03</span>
              </div>
              <div className={styles.shiftTail}>
                <span className={styles.startTime}>08:00 AM</span>
                <span className={styles.endTime}>12:00 PM</span>
              </div>
            </div>
            <div className={styles.shiftItem}>
              <div className={styles.shiftHead}>
                <i className="far fa-clock" />
                <span className={styles.shiftName}>Shift S04</span>
              </div>
              <div className={styles.shiftTail}>
                <span className={styles.startTime}>12:00 PM</span>
                <span className={styles.endTime}>04:00 PM</span>
              </div>
            </div>
            <div className={`${styles.shiftItem} ${styles.available}`}>
              <div className={styles.shiftHead}>
                <i className="far fa-clock" />
                <span className={styles.shiftName}>Shift S05</span>
              </div>
              <div className={styles.shiftTail}>
                <span className={styles.startTime}>04:00 PM</span>
                <span className={styles.endTime}>08:00 PM</span>
              </div>
            </div>
            <div className={styles.shiftItem}>
              <div className={styles.shiftHead}>
                <i className="far fa-clock" />
                <span className={styles.shiftName}>Shift S06</span>
              </div>
              <div className={styles.shiftTail}>
                <span className={styles.startTime}>08:00 PM</span>
                <span className={styles.endTime}>00:00 AM</span>
              </div>
            </div>
          </div>
          <div className="" />
        </div>
      </div>
      <div className={styles.mainContent}>ABC</div>
    </div>
  );
}
