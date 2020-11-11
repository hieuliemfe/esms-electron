/* eslint-disable promise/no-nesting */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable promise/always-return */
import React, { useState, useEffect } from 'react';
import path from 'path';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { ipcRenderer } from 'electron';
import routes from '../../constants/routes.json';
import { getShifts, checkinShift, ShiftInfo } from '../../services/shifts';
import { getShiftTypes, ShiftTypeInfo } from '../../services/shift-types';
import { selectEviUrls, EvidenceUrl } from './homeSlice';
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

const calculateOverTime = (endTime: string) => {
  return (
    new Date(`${new Date().toJSON().split('T')[0]}T${endTime}`).getTime() >
    Date.now()
  );
};

export default function Home() {
  const dispatch = useDispatch();
  const profile: ProfileInfo = useSelector(selectUserProfile) as ProfileInfo;
  const eviUrls: EvidenceUrl[] = useSelector(selectEviUrls) as EvidenceUrl[];
  const history = useHistory();
  const logo = path.join(__dirname, '../resources/esms_logo200.png');
  const [isShowShiftList, setShowShiftList] = useState(true);
  const [shiftList, setShiftList] = useState<ShiftTypeInfo[] | null>(null);

  const viewSessionHistory = () => history.push(routes.SESSION_HISTORY);

  const checkin = (activeShift: ShiftInfo) => {
    if (activeShift) {
      const { counterId, id: shiftId } = activeShift;
      checkinShift(shiftId)
        .then(() => {
          dispatch(setCounterId(counterId));
          dispatch(setShiftId(shiftId));
        })
        .catch(console.log);
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
    getShiftTypes()
      .then((shiftTypeResponse) => {
        if (shiftTypeResponse.status) {
          const shiftTypes = shiftTypeResponse.message;
          if (shiftTypes && shiftTypes.length > 0) {
            const filteredShiftTypes = shiftTypes.map((e) => ({
              ...e,
              isOverTime: calculateOverTime(e.shiftEnd),
            }));
            // getActiveShift()
            //   .then((activeShiftResponse) => {
            //     if (activeShiftResponse.status) {
            //       const activeShifts = activeShiftResponse.message;
            //       if (activeShifts && activeShifts.length > 0) {
            //         const activeShift = activeShifts[0];
            //         checkin(activeShift);
            //       }
            //     }
            //   })
            //   .catch(console.log);
            setShiftList(filteredShiftTypes);
          }
        }
      })
      .catch(console.log);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.sideBar}>
        <span className={styles.appName}>EsmsApp</span>
        <div className={styles.navigation}>
          <div
            className={`${styles.btnNav} ${styles.active} ${styles.noHover}`}
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
            {shiftList && shiftList.length > 0 ? (
              shiftList.map((shiftType: ShiftTypeInfo) => (
                <div className={`${styles.shiftItem}`} key={shiftType.id}>
                  <div className={styles.shiftHead}>
                    <i className="far fa-clock" />
                    <span className={styles.shiftName}>{shiftType.name}</span>
                  </div>
                  <div className={styles.shiftTail}>
                    <span className={styles.startTime}>
                      {shiftType.shiftStart}
                    </span>
                    <span className={styles.endTime}>{shiftType.shiftEnd}</span>
                  </div>
                </div>
              ))
            ) : (
              <></>
            )}
          </div>
          <div className={styles.shiftSeparator} />
          <div className={styles.btnEndShift}>
            <span>End your shift</span>
          </div>
        </div>
      </div>
      <div className={styles.mainContent}>
        <div className={styles.headerWrapper}>
          <div className={styles.firstPart}>
            <div className={styles.calendarWrapper}>
              <span className={styles.calendarTitle}>Nov, 2020</span>
            </div>
            <div className={styles.greetingWrapper}>
              <div className={styles.welcomeWrapper}>
                <span className={styles.hello}>
                  {`Hello, ${profile.fullname}!`}
                </span>
                <span className={styles.tips}>Have a nice day!</span>
                <span className={styles.tips}>
                  Please check in your shift to start working!
                </span>
              </div>
              <img src={logo} alt="ESMSLogo" className={styles.greetingLogo} />
            </div>
          </div>
        </div>
        <div className={styles.footerWrapper}>
          <span className={styles.footerTitle}>Session History</span>
        </div>
      </div>
    </div>
  );
}
