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
      <div className={styles.sideBar}>
        <span className={styles.appName}>ESMS</span>
        <div className={styles.navigation}>
          <div className={`${styles.btnNav} ${styles.active}`}>
            <div className={styles.iconBox}>
              <i className="fa fa-home" />
            </div>
            <span className={styles.btnText}>Home</span>
          </div>
          <div className={styles.btnNav}>
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
    </div>
  );
}
