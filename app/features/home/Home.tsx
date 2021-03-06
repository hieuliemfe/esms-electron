/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable no-nested-ternary */
/* eslint-disable promise/no-nesting */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable promise/always-return */
import React, { useState, useEffect } from 'react';
import path from 'path';
import fs from 'fs';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { ipcRenderer } from 'electron';
import DatePicker from 'react-datepicker';
import enGB from 'date-fns/esm/locale/en-GB';
import routes from '../../constants/routes.json';
import {
  getEmployeeShifts,
  createEmployeeShift,
  checkoutEmployeeShift,
  CreateEmployeeShiftData,
} from '../../services/employee-shifts';
import { getShifts, ShiftInfo } from '../../services/shifts';
import { ProfileInfo } from '../../services/root';
import {
  getWaitingList,
  assignWaiting,
  skipWaiting,
  removeWaiting,
  WaitingInfo,
} from '../../services/waiting-list';
import {
  createSession,
  getSessionSummary,
  availableSessionDate,
  GetSessionSummaryData,
  GetSessionSummaryResult,
  SessionInfo,
  AvailableSessionDateData,
} from '../../services/sessions';
import {
  selectEviVideos,
  selectEviPeriods,
  selectIsShowShiftList,
  selectIsLoggedIn,
  selectIsCheckedIn,
  selectLastUpdateSession,
  selectIsComSocReady,
  selectEvidencePath,
  setEviVideo,
  setEviPeriod,
  setShowShiftList,
  setCheckedIn,
  setCustomerName,
  EvidencePeriods,
  EvidenceUrls,
} from './homeSlice';
import { setLoading } from '../../components/loading-bar/loadingBarSlice';
import {
  selectUserProfile,
  selectCounterId,
  selectShiftId,
  selectRelaxMode,
  selectToken,
  selectSuspension,
  setUserProfile,
  setCounterId,
  setShiftId,
  setRelaxMode,
  setToken,
  setSuspension,
  setLastAccessLogin,
  Suspension,
} from '../login/loginSlice';
import { setSessionId } from '../session/sessionSlice';
import { setToken as setRequestToken } from '../../utils/request';
import styles from './Home.css';
import logo from '../../assets/esms_logo200.png';

const twoDigits = (num: number | string) => `${`0${num}`.substr(-2)}`;

const fourDigits = (num: number | string) =>
  num > 999 ? num : `${`000${num}`.substr(-4)}`;

const getClientDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return `${twoDigits(date.getDate())}/${twoDigits(
    date.getMonth() + 1
  )}/${date.getFullYear()}`;
};

const getClientTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return `${twoDigits(date.getHours())}:${twoDigits(
    date.getMinutes()
  )}:${twoDigits(date.getSeconds())}`;
};

const localExist = (pathToFile: string) => fs.existsSync(pathToFile);

const msToStr = (ms: number, _callCount = 1): string => {
  if (ms < 1000) {
    return `${ms} ms`;
  }
  if (ms < 60000) {
    const secs = Math.floor(ms / 1000);
    return `${secs} sec${secs === 1 ? '' : 's'}`;
  }
  if (ms < 3600000) {
    const mins = Math.floor(ms / 60000);
    return `${mins} min${mins === 1 ? '' : 's'} ${msToStr(
      ms % 60000,
      _callCount + 1
    )}`;
  }
  const hours = Math.floor(ms / 3600000);
  return `${hours} hour${hours === 1 ? '' : 's'} ${msToStr(
    ms % 3600000,
    _callCount + 1
  )}`;
};

const calculateShiftOver = (sh: ShiftInfo) => {
  const currentTime = Date.now();
  const dateStr = new Date().toJSON().split('T')[0];
  const cmpDate = new Date(`${dateStr}T${sh.shiftEnd}`);
  cmpDate.setDate(new Date().getDate());
  const shst = new Date(cmpDate.getTime() - 30 * 60 * 1000).getTime();
  return sh.shiftStart < sh.shiftEnd && shst < currentTime;
};

type DateButtonProps = {
  onClick?: any;
  value?: string;
};

// eslint-disable-next-line react/display-name
const DateButton = React.forwardRef<any, DateButtonProps>(
  (props, forwardedRef) => {
    const { value, onClick } = props;
    return (
      <button
        ref={forwardedRef}
        type="button"
        className={styles.btnDate}
        onClick={onClick}
      >
        {value}
      </button>
    );
  }
);

export default function Home() {
  const dispatch = useDispatch();
  const profile: ProfileInfo = useSelector(selectUserProfile) as ProfileInfo;
  const eviVideos: EvidenceUrls = useSelector(selectEviVideos) as EvidenceUrls;
  const eviPeriods: EvidencePeriods = useSelector(
    selectEviPeriods
  ) as EvidencePeriods;
  const history = useHistory();
  const isShowShiftList = useSelector(selectIsShowShiftList);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const isCheckedIn = useSelector(selectIsCheckedIn);
  const isRelaxMode = useSelector(selectRelaxMode);
  const isComSocReady = useSelector(selectIsComSocReady);
  const evidencePath = useSelector(selectEvidencePath);
  const currentSuspension: Suspension = useSelector(selectSuspension);
  const userToken = useSelector(selectToken);
  const shiftId = useSelector(selectShiftId);
  const counterId = useSelector(selectCounterId);
  const lastUpdateSession = useSelector(selectLastUpdateSession);
  const [shiftList, setShiftList] = useState<ShiftInfo[] | null>(null);
  const [waitingList, setWaitingList] = useState<WaitingInfo[] | null>(null);
  const [isShowEvi, setShowEvi] = useState(false);
  const [videoEviPath, setVideoEviPath] = useState<string | null>(null);
  const [videoEviName, setVideoEviName] = useState<string | null>(null);
  const [periodEviName, setPeriodEviName] = useState<string | null>(null);
  const [sessionList, setSessionList] = useState<SessionInfo[] | null>(null);
  const videoPlayer = React.createRef() as React.RefObject<HTMLVideoElement>;
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [minDate, setMinDate] = useState(new Date());
  const [excludeDates, setExcludeDates] = useState<Date[]>([]);
  const [exitRelaxTimeout, setExitRelaxTimeout] = useState<NodeJS.Timeout>();
  const [waitingTimeout, setWaitingTimeout] = useState<NodeJS.Timeout>();
  const [isOpenedMail, setOpenedMail] = useState(false);
  const [lastUpdateWaiting, setLastUpdateWaiting] = useState(Date.now());

  const getLocalEviPath = (sessionId: number) =>
    path.join(evidencePath, `/session_${fourDigits(sessionId)}`);

  const skipCustomer = (waitingId: number) => {
    dispatch(setLoading(true));
    skipWaiting(waitingId)
      .then((skipResponse) => {
        if (skipResponse.success) {
          dispatch(setLastUpdateWaiting(Date.now()));
          dispatch(setLoading(false));
        }
      })
      .catch(console.log);
  };

  const openMail = () => {
    ipcRenderer.send('open-link', 'https://mail.yandex.com/');
    setOpenedMail(true);
  };

  const removeCustomer = (waitingId: number) => {
    dispatch(setLoading(true));
    removeWaiting(waitingId)
      .then((removeResponse) => {
        if (removeResponse.success) {
          dispatch(setLastUpdateWaiting(Date.now()));
          dispatch(setLoading(false));
        }
      })
      .catch(console.log);
  };

  const showEvi = (sessionId: number) => {
    dispatch(setLoading(true));
    const localEviPath = getLocalEviPath(sessionId);
    const eviName = `session_${fourDigits(sessionId)}`;
    if (localExist(localEviPath)) {
      setVideoEviName(null);
      setVideoEviPath(path.join(localEviPath, './video.mp4'));
      if (!eviPeriods[eviName]) {
        const periodsInfoPath = path.join(localEviPath, './periods_info.json');
        ipcRenderer.send('retrieve-from-local', eviName, periodsInfoPath);
      }
      const videoRef = videoPlayer.current;
      if (videoRef) {
        videoRef.load();
        videoRef.play().catch(console.log);
      }
    } else {
      setVideoEviPath(null);
      if (!eviVideos[eviName]) {
        ipcRenderer.send('sign-url-for-path', eviName, `${eviName}/video.mp4`);
      }
      if (!eviPeriods[eviName]) {
        ipcRenderer.send(
          'sign-url-for-path',
          `periods:${eviName}`,
          `${eviName}/periods_info.json`
        );
      }
      setVideoEviName(eviName);
    }
    setPeriodEviName(eviName);
    setShowEvi(true);
    dispatch(setLoading(false));
  };

  const closeEvi = () => {
    setShowEvi(false);
    const videoRef = videoPlayer.current;
    if (videoRef) {
      videoRef.pause();
    }
  };

  const skipToPeriod = (ms: number) => {
    const videoRef = videoPlayer.current;
    if (videoRef) {
      videoRef.currentTime = ms / 1000;
      videoRef.play().catch(console.log);
    }
  };

  const getCustomerWaitingList = () => {
    getWaitingList()
      .then((waitingResponse) => {
        if (waitingResponse.success) {
          const data = waitingResponse.message;
          setWaitingList(data);
          if (waitingTimeout) {
            clearTimeout(waitingTimeout);
          }
          setWaitingTimeout(
            setTimeout(() => {
              getCustomerWaitingList();
            }, 5000)
          );
        }
      })
      .catch(console.log);
  };

  useEffect(() => {
    if (isRelaxMode) {
      if (exitRelaxTimeout) {
        clearTimeout(exitRelaxTimeout);
      }
      if (currentSuspension) {
        const expiration = new Date(currentSuspension.expiredOn);
        const time = expiration.getTime() - Date.now();
        setExitRelaxTimeout(
          setTimeout(() => {
            ipcRenderer.send(
              'exit-relax-mode',
              'Your relax time is over. Please get back to work!'
            );
          }, time)
        );
      }
    }
  }, [isRelaxMode]);

  useEffect(() => {
    if (showEvi && videoEviName) {
      const videoRef = videoPlayer.current;
      if (videoRef) {
        videoRef.load();
        videoRef.play().catch(console.log);
      }
    }
  }, [eviVideos, videoEviName, showEvi]);

  useEffect(() => {
    console.log('[eviPeriods]:', eviPeriods);
  }, [eviPeriods]);

  const startSession = (waiting: WaitingInfo) => {
    dispatch(setLoading(true));
    assignWaiting(counterId, waiting.id)
      .then(async (assignResponse) => {
        if (assignResponse.success) {
          const createSessionResponse = await createSession(
            waiting.customerName
          );
          if (createSessionResponse.success) {
            const sessionInfo = createSessionResponse.message;
            dispatch(setSessionId(sessionInfo.id));
            dispatch(setLoading(false));
            dispatch(setCustomerName(waiting.customerName));
            ipcRenderer.send('store-session-id', sessionInfo.id);
            if (waitingTimeout) {
              clearTimeout(waitingTimeout);
            }
            history.push(routes.SESSION);
          }
        }
      })
      .catch((error) => console.log(error));
  };

  const checkin = (selectedShift: ShiftInfo | undefined) => {
    dispatch(setLoading(true));
    if (selectedShift) {
      const createShiftData: CreateEmployeeShiftData = {
        shiftId: selectedShift.id,
      };
      createEmployeeShift(createShiftData)
        .then((createShiftResponse) => {
          if (createShiftResponse.success) {
            const { shiftId: shId } = createShiftResponse.message;
            dispatch(setShiftId(shId));
            if (!isCheckedIn) {
              dispatch(setCheckedIn(true));
            }
            dispatch(setShowShiftList(false));
            dispatch(setLoading(false));
          }
        })
        .catch(console.log);
    } else {
      dispatch(setLoading(false));
    }
  };

  const checkout = () => {
    checkoutEmployeeShift(shiftId)
      .then(() => {
        dispatch(setShiftId(0));
        dispatch(setCheckedIn(false));
      })
      .catch(console.log);
  };

  const toggleShowShiftList = () => {
    if (!isRelaxMode) {
      dispatch(setShowShiftList(!isShowShiftList));
    }
  };

  const logout = () => {
    if (exitRelaxTimeout) {
      clearTimeout(exitRelaxTimeout);
    }
    if (waitingTimeout) {
      clearTimeout(waitingTimeout);
    }
    setRequestToken(null);
    dispatch(setCounterId(0));
    dispatch(setShiftId(0));
    dispatch(setToken(''));
    dispatch(setCheckedIn(false));
    dispatch(setUserProfile({}));
    dispatch(setShowShiftList(true));
    dispatch(setRelaxMode(false));
    dispatch(setEviVideo({}));
    dispatch(setEviPeriod({}));
    dispatch(setSuspension({}));
    ipcRenderer.send('reset-token');
    ipcRenderer.send('logout');
    dispatch(setLastAccessLogin(Date.now()));
    history.goBack();
  };

  useEffect(() => {
    if (isRelaxMode && !isLoggedIn) {
      logout();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isRelaxMode && isCheckedIn) {
      getCustomerWaitingList();
    }
  }, [lastUpdateWaiting]);

  useEffect(() => {
    dispatch(setLoading(true));
    const startDate = new Date(selectedDay);
    startDate.setHours(0);
    startDate.setMinutes(0);
    startDate.setSeconds(0);
    startDate.setMilliseconds(0);
    const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
    if (isRelaxMode) {
      startDate.setTime(
        startDate.getTime() -
          ((startDate.getDay() !== 0 ? startDate.getDay() : 7) - 1) *
            24 *
            60 *
            60 *
            1000
      );
    }
    const getSessionSummaryData: GetSessionSummaryData = {
      employeeCode: profile.employeeCode,
      startDate: startDate.toJSON(),
      endDate: endDate.toJSON(),
    };
    getSessionSummary(getSessionSummaryData)
      .then((sessionSummaryResponse) => {
        if (sessionSummaryResponse.success) {
          const result: GetSessionSummaryResult =
            sessionSummaryResponse.message;
          if (result) {
            dispatch(setLoading(false));
            let { sessions } = result;
            if (isRelaxMode) {
              sessions = sessions.filter((s) => s.angryWarningCount > 0);
            }
            setSessionList(sessions);
          }
        }
      })
      .catch(console.log);

    if (!isRelaxMode && isCheckedIn) {
      getCustomerWaitingList();
    }
  }, [isCheckedIn, selectedDay, lastUpdateSession]);

  useEffect(() => {
    if (!isRelaxMode) {
      dispatch(setLoading(true));
      getShifts()
        .then((shiftResponse) => {
          if (shiftResponse.success) {
            const shifts = shiftResponse.message;
            if (shifts && shifts.length > 0) {
              let foundToCheckinShift = false;
              shifts.forEach((sh) => {
                sh.isOver = calculateShiftOver(sh);
                if (!sh.isOver && !foundToCheckinShift) {
                  sh.isToCheckIn = true;
                  foundToCheckinShift = true;
                }
              });
              getEmployeeShifts()
                .then((employeeShiftResponse) => {
                  if (employeeShiftResponse.success) {
                    const empShifts = employeeShiftResponse.message;
                    if (empShifts) {
                      const { activeShifts } = empShifts;
                      if (activeShifts && activeShifts.length > 0) {
                        const activeShift = activeShifts[0];
                        const shiftActive = shifts.find(
                          (s) => s.id === activeShift.Shift.id
                        );
                        if (shiftActive) {
                          shiftActive.isActive = true;
                        }
                        dispatch(setShiftId(activeShift.id));
                        if (!isCheckedIn) {
                          dispatch(setCheckedIn(true));
                        }
                        dispatch(setShowShiftList(false));
                      }
                      setShiftList(shifts);
                    }
                  }
                  dispatch(setLoading(false));
                })
                .catch(console.log);
            }
          }
        })
        .catch(console.log);
    }
  }, [isCheckedIn]);

  useEffect(() => {
    if (userToken) {
      const currentDate = new Date();
      currentDate.setMilliseconds(0);
      currentDate.setSeconds(0);
      currentDate.setMinutes(0);
      currentDate.setHours(0);
      const startDate = new Date(currentDate);
      if (isRelaxMode) {
        startDate.setTime(
          startDate.getTime() -
            ((startDate.getDay() !== 0 ? startDate.getDay() : 7) - 1) *
              24 *
              60 *
              60 *
              1000
        );
      } else if (currentDate.getDate() > 15) {
        startDate.setDate(15);
      } else {
        startDate.setDate(1);
      }
      setMinDate(startDate);
      const availableSessionDateData: AvailableSessionDateData = {
        employeeCode: profile.employeeCode,
        startDate: startDate.toJSON(),
        endDate: currentDate.toJSON(),
      };
      availableSessionDate(availableSessionDateData)
        .then((availableSessionDateResponse) => {
          if (availableSessionDateResponse.success) {
            const availableList = availableSessionDateResponse.message;
            if (availableList) {
              const dateList = Object.keys(availableList);
              if (dateList.length > 0) {
                const exDates: Date[] = [];
                let slDate = new Date();
                // eslint-disable-next-line no-plusplus
                for (let i = 0; i < dateList.length; i++) {
                  const date = dateList[i];
                  if (
                    Object.prototype.hasOwnProperty.call(availableList, date)
                  ) {
                    const sessionCount = availableList[date];
                    if (sessionCount === 0) {
                      exDates.push(
                        new Date(
                          `${date.split('-').reverse().join('-')}T00:00:00`
                        )
                      );
                    } else {
                      slDate = new Date(
                        `${date.split('-').reverse().join('-')}T00:00:00`
                      );
                    }
                  }
                }
                console.log('exDates', exDates);
                setExcludeDates(exDates);
                setSelectedDay(slDate);
              }
            }
          }
        })
        .catch(console.log);
    }
  }, [userToken, lastUpdateSession]);

  return (
    <div className={styles.container}>
      <div className={styles.sideBar}>
        <span className={styles.appName}>
          <span>ESMS</span>
          <br />
          <span>{`${isRelaxMode ? 'RelaxMode' : 'BankTellerApp'}`}</span>
        </span>
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
            } ${isRelaxMode ? styles.noHover : ''}`}
            onClick={() => toggleShowShiftList()}
          >
            <div className={styles.iconBox}>
              {isRelaxMode ? (
                <i className="fas fa-book-reader" />
              ) : (
                <i className="far fa-calendar-alt" />
              )}
            </div>
            <span className={styles.btnText}>
              {`${isRelaxMode ? 'Guideline' : 'Shifts'}`}
            </span>
          </div>
          {currentSuspension.id ? (
            <div
              className={`${styles.btnNav} ${styles.active} ${
                !isOpenedMail ? styles.hasNoti : ''
              }`}
              onClick={() => openMail()}
            >
              <div className={styles.iconBox}>
                <i className="fas fa-envelope" />
              </div>
              <span className={styles.btnText}>Mail</span>
            </div>
          ) : (
            <></>
          )}
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
                draggable={false}
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
        } ${isRelaxMode ? styles.relaxMode : ''}`}
      >
        <div className={styles.shiftListInner}>
          {isRelaxMode ? (
            <>
              <span className={styles.shiftListTitle}>Behavior Guidelines</span>
              <div className={styles.behaviorWrapper}>
                <iframe
                  title="BehaviorGuideline"
                  src="https://www.youtube.com/embed/videoseries?list=PLYvYevIwI4IZphB6jBe76ErzuNPjWOXrL&rel=0&fs=0&iv_load_policy=3&loop=1&modestbranding=1"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <span className={styles.behaviorTitle}>Relax Video</span>
              <div className={styles.behaviorWrapper}>
                <iframe
                  title="RelaxVideo"
                  src="https://www.youtube.com/embed/9Q634rbsypE?rel=0&fs=0&iv_load_policy=3&loop=1&modestbranding=1"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </>
          ) : (
            <>
              <span className={styles.shiftListTitle}>Today shifts</span>
              <div className={styles.shiftList}>
                {shiftList && shiftList.length > 0 ? (
                  shiftList.map((sh: ShiftInfo) => (
                    <div
                      className={`${styles.shiftItem} ${
                        sh.isActive
                          ? styles.active
                          : sh.isOver
                          ? styles.inactive
                          : isCheckedIn
                          ? styles.unavailable
                          : ''
                      }`}
                      key={sh.id}
                    >
                      <div className={styles.shiftHead}>
                        <i className="far fa-clock" />
                        <span className={styles.shiftName}>{sh.name}</span>
                      </div>
                      <div className={styles.shiftTail}>
                        <span className={styles.startTime}>
                          {sh.shiftStart}
                        </span>
                        <span className={styles.endTime}>{sh.shiftEnd}</span>
                        {!isCheckedIn && sh.isToCheckIn ? (
                          <div
                            className={styles.shiftBtn}
                            onClick={() => checkin(sh)}
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
                  <div
                    className={styles.btnEndShift}
                    onClick={() => checkout()}
                  >
                    <span>Check Out Shift</span>
                  </div>
                </>
              ) : (
                <></>
              )}
            </>
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
            {/* <div className={styles.calendarWrapper}>
              <DayPicker />
            </div> */}
            <div className={styles.greetingWrapper}>
              <div className={styles.welcomeWrapper}>
                <span className={styles.hello}>
                  {`Hello, ${profile.fullname}!`}
                </span>
                {!isRelaxMode ? (
                  <span className={styles.tips}>Have a nice day!</span>
                ) : (
                  <></>
                )}
                <span className={styles.tips}>
                  {`${
                    isRelaxMode
                      ? 'You are in Relax Mode. Please take a break and enjoy it.'
                      : 'Please check in your shift to start working!'
                  }`}
                </span>
                {isRelaxMode ? (
                  <>
                    <span className={styles.tips}>
                      {'Your account is suspended until '}
                      <b>{getClientDate(currentSuspension.expiredOn)}</b>
                      {' at '}
                      <b>{getClientTime(currentSuspension.expiredOn)}</b>
                    </span>
                    <span className={styles.tips}>
                      {`Reason: ${
                        currentSuspension.reason
                          ? currentSuspension.reason
                          : 'N/A'
                      }`}
                    </span>
                  </>
                ) : (
                  <></>
                )}
              </div>
              <img
                src={logo}
                alt="ESMSLogo"
                className={styles.greetingLogo}
                draggable={false}
              />
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
              <div
                className={`${styles.waitingList} ${
                  isComSocReady && evidencePath ? '' : styles.notReady
                }`}
              >
                {waitingList && waitingList.length > 0 ? (
                  <div className={styles.waitingInner}>
                    {waitingList.map((waiting: WaitingInfo) => (
                      <div className={styles.waitingItem} key={waiting.id}>
                        <div className={styles.waitingItemHead}>
                          <i className={`far fa-user ${styles.queueIcon}`} />
                          <span className={styles.waitingNo}>
                            {fourDigits(waiting.number)}
                          </span>
                          <i
                            className={`fas fa-times-circle ${styles.removeIcon}`}
                            onClick={() => removeCustomer(waiting.id)}
                          />
                          <div
                            className={styles.startSessionBtn}
                            onClick={() => startSession(waiting)}
                          >
                            Start Session
                          </div>
                          <i
                            className={`fas fa-forward ${styles.skipIcon}`}
                            onClick={() => skipCustomer(waiting.id)}
                          />
                        </div>
                        <div className={styles.waitingItemTail}>
                          <span className={styles.wNo}>
                            {waiting.customerName}
                          </span>
                          <span className={styles.wCat}>
                            {waiting.Category.categoryName}
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
          <div className={styles.footerInner}>
            <div className={styles.resultWrapper}>
              <div className={styles.resultTextWrapper}>
                <span className={styles.footerTitle}>
                  {isRelaxMode
                    ? 'This Week Warning Sessions'
                    : 'Session History'}
                </span>
              </div>
            </div>
            <div
              className={`${styles.footerTailWrapper} ${
                isShowEvi ? styles.showVideo : ''
              }`}
            >
              <div className={styles.videoWrapper}>
                {eviPeriods &&
                periodEviName &&
                eviPeriods[periodEviName] &&
                eviPeriods[periodEviName].length > 0 ? (
                  <div className={styles.angryPeriodsWrapper}>
                    <span className={styles.angryPeriodsTitle}>
                      Angry Periods:
                    </span>
                    <div className={styles.angryPeriodsInner}>
                      <div className={styles.angryPeriodsInnerInner}>
                        {isShowEvi ? (
                          <div className={styles.angryPeriods}>
                            {eviPeriods[periodEviName].map((period) => (
                              <div
                                className={styles.periodItem}
                                key={period.period_start}
                                onClick={() => {
                                  skipToPeriod(period.period_start);
                                }}
                              >
                                <div className={styles.periodHead}>
                                  <i className="fas fa-history" />
                                  <span className={styles.periodName}>
                                    {`P${fourDigits(period.no)}`}
                                  </span>
                                </div>
                                <div className={styles.periodTail}>
                                  <span className={styles.periodDuration}>
                                    {`Duration: ${msToStr(period.duration)}`}
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
                ) : (
                  <></>
                )}
                <div className={styles.videoInner}>
                  <div className={styles.videoOuter}>
                    <div
                      className={styles.btnCloseEvi}
                      onClick={() => closeEvi()}
                    >
                      <i className="fa fa-times" />
                      {` Close`}
                    </div>
                    {videoEviPath ? (
                      <video ref={videoPlayer} controls autoPlay>
                        <source src={videoEviPath} type="video/mp4" />
                        No video found
                      </video>
                    ) : videoEviName ? (
                      <video ref={videoPlayer} controls autoPlay>
                        <source
                          src={eviVideos[videoEviName]}
                          type="video/mp4"
                        />
                        No video found
                      </video>
                    ) : (
                      <></>
                    )}
                  </div>
                </div>
              </div>
              <div className={styles.sessionListWrapper}>
                <div className={styles.btnDateWrapper}>
                  {!isRelaxMode ? (
                    <DatePicker
                      selected={selectedDay}
                      popperPlacement="bottom-start"
                      onChange={(date) => setSelectedDay(date as Date)}
                      maxDate={new Date()}
                      minDate={minDate}
                      locale={enGB}
                      excludeDates={excludeDates}
                      dateFormat="MMMM dd, yyyy"
                      customInput={<DateButton />}
                    />
                  ) : (
                    <></>
                  )}
                </div>
                <div className={styles.sessionList}>
                  {sessionList && sessionList.length > 0 ? (
                    <div className={styles.sessionInner}>
                      {sessionList.map((session: SessionInfo) => (
                        <div className={styles.sessionItem} key={session.id}>
                          <div
                            className={styles.sessionItemHead}
                            onClick={() => showEvi(session.id)}
                          >
                            <i className="far fa-clock" />
                            <div className={styles.viewEviBtn}>
                              Show Evidence
                            </div>
                          </div>
                          <div className={styles.sessionItemTail}>
                            <span className={styles.sname}>
                              {`session_${fourDigits(session.id)}`}
                            </span>
                            <span />
                            <span className={styles.stime}>
                              {`Customer: ${session.customerName || 'N/A'}`}
                            </span>
                            <span className={styles.stime}>
                              {`Date: ${getClientDate(session.sessionStart)}`}
                            </span>
                            <span className={styles.stime}>
                              {`Time: ${getClientTime(session.sessionStart)}`}
                            </span>
                            <span className={styles.stime}>
                              {`Duration: ${msToStr(session.sessionDuration)}`}
                            </span>
                            <span className={styles.stime}>
                              {`Angry Warnings: ${session.angryWarningCount}`}
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
        </div>
      </div>
    </div>
  );
}
