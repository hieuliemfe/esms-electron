/* eslint-disable no-nested-ternary */
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
import {
  getShifts,
  checkinShift,
  checkoutShift,
  ShiftInfo,
} from '../../services/shifts';
import { getShiftTypes, ShiftTypeInfo } from '../../services/shift-types';
import { getQueues, assignQueue, QueueInfo } from '../../services/queues';
import { createSession } from '../../services/sessions';
import { selectEviUrls, EvidenceUrl } from './homeSlice';
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
import styles from './Home.css';

const twoDigits = (num: number | string) => `${`0${num}`.substr(-2)}`;
const fourDigits = (num: number | string) => `${`000${num}`.substr(-4)}`;

export default function Home() {
  const dispatch = useDispatch();
  const profile: ProfileInfo = useSelector(selectUserProfile) as ProfileInfo;
  const eviUrls: EvidenceUrl[] = useSelector(selectEviUrls) as EvidenceUrl[];
  const history = useHistory();
  const logo = path.join(__dirname, '../resources/esms_logo200.png');
  const [isShowShiftList, setShowShiftList] = useState(true);
  const [isCheckedIn, setCheckedIn] = useState(false);
  const shiftId = useSelector(selectShiftId);
  const counterId = useSelector(selectCounterId);
  const [shiftList, setShiftList] = useState<ShiftTypeInfo[] | null>(null);
  const [queueList, setQueueList] = useState<QueueInfo[] | null>(null);

  const startSession = (queueId: number) => {
    assignQueue(counterId, queueId)
      .then(async (assignResponse) => {
        if (assignResponse.status) {
          const createSessionResponse = await createSession();
          if (createSessionResponse.status) {
            const shiftInfo = createSessionResponse.message;
            dispatch(setSessionId(shiftInfo.id));
            history.push(routes.SESSION);
          }
        }
      })
      .catch((error) => console.log(error));
  };

  const checkin = (selectedShift: ShiftInfo | undefined) => {
    if (selectedShift) {
      const { counterId: ctId, id: shId } = selectedShift;
      checkinShift(shId)
        .then(() => {
          dispatch(setCounterId(ctId));
          dispatch(setShiftId(shId));
          if (!isCheckedIn) {
            setCheckedIn(true);
          }
          setShowShiftList(false);
        })
        .catch(console.log);
    }
  };

  const checkout = () => {
    checkoutShift(shiftId)
      .then(() => {
        dispatch(setCounterId(0));
        dispatch(setShiftId(0));
        setCheckedIn(false);
      })
      .catch((error) => console.log(error));
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
          const shifts = shiftTypeResponse.message;
          if (shifts && shifts.length > 0) {
            getShifts()
              .then((shiftResponse) => {
                if (shiftResponse.status) {
                  const empShifts = shiftResponse.message;
                  if (empShifts) {
                    const { activeShifts, upcomingShifts } = empShifts;
                    if (activeShifts && activeShifts.length > 0) {
                      const activeShift = activeShifts[0];
                      const shiftActive = shifts.find(
                        (s) => s.id === activeShift.ShiftType.id
                      );
                      if (shiftActive) {
                        shiftActive.isActive = true;
                      }
                      checkin(activeShift);
                    }
                    if (upcomingShifts && upcomingShifts.length > 0) {
                      upcomingShifts.forEach((ups, ind) => {
                        const shiftUpcoming = shifts.find(
                          (s) => s.id === ups.ShiftType.id
                        );
                        if (shiftUpcoming) {
                          if (
                            ind === 0 &&
                            (!activeShifts || activeShifts.length === 0)
                          ) {
                            shiftUpcoming.isToCheckIn = true;
                            shiftUpcoming.ShiftToCheckIn = ups;
                          }
                          shiftUpcoming.isAvailable = true;
                        }
                      });
                    }
                    setShiftList(shifts);
                  }
                }
              })
              .catch(console.log);
          }
        }
      })
      .catch(console.log);

    if (isCheckedIn) {
      getQueues()
        .then((queueResponse) => {
          if (queueResponse.status) {
            const data = queueResponse.message;
            setQueueList(data);
          }
        })
        .catch((error) => console.log(error));
    }
  }, [isCheckedIn]);

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
              shiftList.map((sh: ShiftTypeInfo) => (
                <div
                  className={`${styles.shiftItem} ${
                    sh.isActive
                      ? styles.active
                      : sh.isAvailable
                      ? styles.available
                      : ''
                  }`}
                  key={sh.id}
                >
                  <div className={styles.shiftHead}>
                    <i className="far fa-clock" />
                    <span className={styles.shiftName}>{sh.name}</span>
                  </div>
                  <div className={styles.shiftTail}>
                    <span className={styles.startTime}>{sh.shiftStart}</span>
                    <span className={styles.endTime}>{sh.shiftEnd}</span>
                    {sh.isToCheckIn ? (
                      <div
                        className={styles.shiftBtn}
                        onClick={() => checkin(sh.ShiftToCheckIn)}
                      >
                        Check in
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <></>
            )}
          </div>
          {isCheckedIn ? (
            <>
              <div className={styles.shiftSeparator} />
              <div className={styles.btnEndShift} onClick={() => checkout()}>
                <span>End your shift</span>
              </div>
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
      <div className={styles.mainContent}>
        <div
          className={`${styles.headerWrapper} ${
            isCheckedIn ? styles.isCheckedIn : ''
          }`}
        >
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
          <div
            className={`${styles.secondPart} ${
              !isCheckedIn ? styles.overflowHidden : ''
            }`}
          >
            <div className={styles.waitingListWrapper}>
              <span className={styles.waitingListTitle}>
                Customer Waiting List
              </span>
              <div className={styles.waitingList}>
                {queueList && queueList.length > 0 ? (
                  <div
                    className={styles.waitingInner}
                    style={{ width: 40 + 180 * queueList.length }}
                  >
                    {queueList.map((queue: QueueInfo) => (
                      <div className={styles.waitingItem} key={queue.id}>
                        <div className={styles.waitingItemHead}>
                          <i className="far fa-user" />
                          <div
                            className={styles.startSessionBtn}
                            onClick={() => startSession(queue.id)}
                          >
                            Start Session
                          </div>
                        </div>
                        <div className={styles.waitingItemTail}>
                          <span className={styles.wNo}>
                            {fourDigits(queue.number)}
                          </span>
                          <span className={styles.wCat}>
                            {queue.Category.categoryName}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <></>
                )}
              </div>
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
