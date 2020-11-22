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
import routes from '../../constants/routes.json';
import {
  getShifts,
  createShift,
  checkoutShift,
  CreateShiftData,
} from '../../services/shifts';
import { getShiftTypes, ShiftTypeInfo } from '../../services/shift-types';
import { ProfileInfo } from '../../services/root';
import {
  getQueues,
  assignQueue,
  skipQueue,
  removeQueue,
  QueueInfo,
} from '../../services/queues';
import {
  createSession,
  getSessionSummary,
  GetSessionSummaryData,
  GetSessionSummaryResult,
  SessionInfo,
} from '../../services/sessions';
import {
  selectEviVideos,
  selectEviPeriods,
  selectIsShowShiftList,
  selectIsCheckedIn,
  selectLastUpdateSession,
  setShowShiftList,
  setCheckedIn,
  setLastUpdateSession,
  EvidencePeriods,
  EvidenceUrls,
} from './homeSlice';
import { setLoading } from '../../components/loading-bar/loadingBarSlice';
import {
  selectUserProfile,
  selectCounterId,
  selectShiftId,
  selectRelaxMode,
  setToken,
  setUserProfile,
  setCounterId,
  setShiftId,
  setRelaxMode,
} from '../login/loginSlice';
import { setSessionId } from '../session/sessionSlice';
import { setToken as setRequestToken } from '../../utils/request';
import styles from './Home.css';

const twoDigits = (num: number | string) => `${`0${num}`.substr(-2)}`;

const fourDigits = (num: number | string) =>
  num > 999 ? num : `${`000${num}`.substr(-4)}`;

const getClientTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return `${twoDigits(date.getHours())}:${twoDigits(
    date.getMinutes()
  )}:${twoDigits(date.getSeconds())}`;
};

const getLocalEviPath = (sessionId: number) =>
  path.join(__dirname, `../evidences/session_${fourDigits(sessionId)}`);

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

const calculateShiftOver = (sh: ShiftTypeInfo) => {
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
  const logo = path.join(__dirname, '../resources/esms_logo200.png');
  const isShowShiftList = useSelector(selectIsShowShiftList);
  const isCheckedIn = useSelector(selectIsCheckedIn);
  const isRelaxMode = useSelector(selectRelaxMode);
  const shiftId = useSelector(selectShiftId);
  const counterId = useSelector(selectCounterId);
  const lastUpdateSession = useSelector(selectLastUpdateSession);
  const [shiftList, setShiftList] = useState<ShiftTypeInfo[] | null>(null);
  const [queueList, setQueueList] = useState<QueueInfo[] | null>(null);
  const [isShowEvi, setShowEvi] = useState(false);
  const [videoEviPath, setVideoEviPath] = useState<string | null>(null);
  const [videoEviName, setVideoEviName] = useState<string | null>(null);
  const [periodEviName, setPeriodEviName] = useState<string | null>(null);
  const [sessionList, setSessionList] = useState<SessionInfo[] | null>(null);
  const videoPlayer = React.createRef() as React.RefObject<HTMLVideoElement>;
  const [selectedDay, setSelectedDay] = useState(new Date());

  const skipCustomer = (queueId: number) => {
    dispatch(setLoading(true));
    skipQueue(queueId)
      .then((skipQueueResponse) => {
        if (skipQueueResponse.success) {
          dispatch(setLastUpdateSession(Date.now()));
          dispatch(setLoading(false));
        }
      })
      .catch(console.log);
  };

  const removeCustomer = (queueId: number) => {
    dispatch(setLoading(true));
    removeQueue(queueId)
      .then((removeQueueResponse) => {
        if (removeQueueResponse.success) {
          dispatch(setLastUpdateSession(Date.now()));
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

  const startSession = (queueId: number) => {
    dispatch(setLoading(true));
    assignQueue(counterId, queueId)
      .then(async (assignResponse) => {
        if (assignResponse.success) {
          const createSessionResponse = await createSession();
          if (createSessionResponse.success) {
            const sessionInfo = createSessionResponse.message;
            dispatch(setSessionId(sessionInfo.id));
            dispatch(setLoading(false));
            history.push(routes.SESSION);
          }
        }
      })
      .catch((error) => console.log(error));
  };

  const checkin = (selectedShiftType: ShiftTypeInfo | undefined) => {
    dispatch(setLoading(true));
    if (selectedShiftType) {
      const createShiftData: CreateShiftData = {
        shiftTypeId: selectedShiftType.id,
      };
      createShift(createShiftData)
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
    checkoutShift(shiftId)
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
    dispatch(setLoading(true));
    setRequestToken(null);
    dispatch(setCounterId(0));
    dispatch(setShiftId(0));
    dispatch(setToken(''));
    dispatch(setCheckedIn(false));
    dispatch(setUserProfile({}));
    dispatch(setShowShiftList(true));
    dispatch(setRelaxMode(false));
    ipcRenderer.send('logout');
    dispatch(setLoading(false));
    history.push('/');
  };

  useEffect(() => {
    dispatch(setLoading(true));
    const startDate = new Date(selectedDay);
    startDate.setHours(0);
    startDate.setMinutes(0);
    startDate.setSeconds(0);
    startDate.setMilliseconds(0);
    const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
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
            setSessionList(result.sessions);
          }
        }
      })
      .catch(console.log);

    if (isCheckedIn) {
      getQueues()
        .then((queueResponse) => {
          if (queueResponse.success) {
            const data = queueResponse.message;
            setQueueList(data);
          }
        })
        .catch(console.log);
    }
  }, [isCheckedIn, selectedDay, lastUpdateSession]);

  useEffect(() => {
    dispatch(setLoading(true));
    getShiftTypes()
      .then((shiftTypeResponse) => {
        if (shiftTypeResponse.success) {
          const shifts = shiftTypeResponse.message;
          if (shifts && shifts.length > 0) {
            let foundToCheckinShift = false;
            shifts.forEach((sh) => {
              sh.isOver = calculateShiftOver(sh);
              if (!sh.isOver && !foundToCheckinShift) {
                sh.isToCheckIn = true;
                foundToCheckinShift = true;
              }
            });
            getShifts()
              .then((shiftResponse) => {
                if (shiftResponse.success) {
                  const empShifts = shiftResponse.message;
                  if (empShifts) {
                    const { activeShifts } = empShifts;
                    if (activeShifts && activeShifts.length > 0) {
                      const activeShift = activeShifts[0];
                      const shiftActive = shifts.find(
                        (s) => s.id === activeShift.ShiftType.id
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
        } ${isRelaxMode ? styles.relaxMode : ''}`}
      >
        <div className={styles.shiftListInner}>
          {isRelaxMode ? (
            <>
              <span className={styles.shiftListTitle}>Behavior guideline</span>
              <div className={styles.behaviorWrapper}>
                <iframe
                  title="BehaviorGuideline"
                  src="https://www.youtube.com/embed/VUvI0gQmlho"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <span className={styles.behaviorTitle}>Relax video</span>
              <div className={styles.behaviorWrapper}>
                <iframe
                  title="RelaxVideo"
                  src="https://www.youtube.com/embed/9Q634rbsypE"
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
                  shiftList.map((sh: ShiftTypeInfo) => (
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
                <span className={styles.tips}>Have a nice day!</span>
                <span className={styles.tips}>
                  {`${
                    isRelaxMode
                      ? 'You are in Relax Mode. Please take a break and enjoy it.'
                      : 'Please check in your shift to start working!'
                  }`}
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
                  <div className={styles.waitingInner}>
                    {queueList.map((queue: QueueInfo) => (
                      <div className={styles.waitingItem} key={queue.id}>
                        <div className={styles.waitingItemHead}>
                          <i className={`far fa-user ${styles.queueIcon}`} />
                          <span className={styles.waitingNo}>
                            {fourDigits(queue.number)}
                          </span>
                          <i
                            className={`fas fa-times-circle ${styles.removeIcon}`}
                            onClick={() => removeCustomer(queue.id)}
                          />
                          <div
                            className={styles.startSessionBtn}
                            onClick={() => startSession(queue.id)}
                          >
                            Start Session
                          </div>
                          <i
                            className={`fas fa-forward ${styles.skipIcon}`}
                            onClick={() => skipCustomer(queue.id)}
                          />
                        </div>
                        <div className={styles.waitingItemTail}>
                          <span className={styles.wNo}>
                            {queue.customerName}
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
          <div className={styles.footerInner}>
            <div className={styles.resultWrapper}>
              <div className={styles.resultTextWrapper}>
                <span className={styles.footerTitle}>Session History</span>
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
                  <DatePicker
                    selected={selectedDay}
                    popperPlacement="bottom-start"
                    onChange={(date) => setSelectedDay(date as Date)}
                    maxDate={new Date()}
                    dateFormat="MMM dd, yyyy"
                    customInput={<DateButton />}
                  />
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
                              {`Time: ${getClientTime(session.sessionStart)}`}
                            </span>
                            <span className={styles.stime}>
                              {`Duration: ${msToStr(session.sessionDuration)}`}
                            </span>
                            <span className={styles.stime}>
                              {`Angries: ${session.angryWarningCount}`}
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
