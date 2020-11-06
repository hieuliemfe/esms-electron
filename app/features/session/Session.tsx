/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable promise/always-return */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import path from 'path';
import {
  startSession,
  endSession,
  EmotionInfo,
  EmotionPeriodInfo,
  EndSessionInfo,
} from '../../services/sessions';
import {
  getCounterCategory,
  getCategoryTasks,
  CategoryInfo,
} from '../../services/categories';
import {
  setSessionDetectedResult,
  selectSessionId,
  SessionDetectedInfo,
} from './sessionSlice';
import { selectCounterId } from '../login/loginSlice';
import { setShow } from '../../components/modals/angryWarningModalSlice';
import {
  createClientSocket,
  setComSocHandler,
  COMMUNICATION_SOCKET,
} from '../../socket.dev';
import styles from './Session.css';

const fourDigits = (num: number | string) => `${`000${num}`.substr(-4)}`;

export default function Session() {
  const dispatch = useDispatch();
  const counterId = useSelector(selectCounterId);
  const sessionId = useSelector(selectSessionId);
  const history = useHistory();
  const [categoryList, setCategoryList] = useState<CategoryInfo[] | null>(null);
  const [frame, setFrame] = useState(
    path.join(__dirname, '../resources/video.jpg')
  );
  const [needRetryConnect] = useState({ value: true });
  const [start, setStart] = useState(false);
  const [kill, setKill] = useState(false);
  let sessionDetectedResult: SessionDetectedInfo;
  let sessionEmotionInfo: EmotionInfo[] = [];
  let endSessionInfo: EndSessionInfo;

  useEffect(() => {
    getCounterCategory(counterId)
      .then(async (counterCategoryResponse) => {
        if (counterCategoryResponse.status) {
          const data = counterCategoryResponse.message;
          const catList: CategoryInfo[] = data.map((cat) => cat.Category);
          if (catList && catList.length > 0) {
            for (let i = 0; i < catList.length; i++) {
              const cat = catList[i];
              const taskListResponse = await getCategoryTasks(cat.id);
              if (taskListResponse.status) {
                const taskList = taskListResponse.message;
                cat.taskList = taskList;
              }
            }
            setCategoryList(catList);
          }
        }
      })
      .catch((error) => console.log(error));
    startSession(sessionId).catch((error) => console.log(error));
  }, [counterId]);

  useEffect(() => {
    if (COMMUNICATION_SOCKET.SOCKET) {
      setComSocHandler((payload: string) => {
        const eventType = payload.substring(0, payload.indexOf(':'));
        const dataStr = payload.substring(payload.indexOf(':') + 1);
        console.log('eventType', eventType);
        console.log('dataStr', dataStr);
        switch (eventType) {
          case 'StreamPort':
            createClientSocket(
              Number.parseInt(dataStr, 10),
              (data: string) => {
                const response = JSON.parse(data);
                dispatch(setShow(!!response.is_warning));
                setFrame(`data:image/png;base64,${response.img_src}`);
              },
              () => needRetryConnect.value
            );
            break;
          case 'SessionResult':
            sessionDetectedResult = JSON.parse(dataStr) as SessionDetectedInfo;
            dispatch(setSessionDetectedResult(sessionDetectedResult));
            if (
              sessionDetectedResult &&
              sessionDetectedResult.periods &&
              sessionDetectedResult.periods.length > 0
            ) {
              sessionEmotionInfo = sessionDetectedResult.periods.map(
                (ps, i) =>
                  ({
                    emotion: i + 1,
                    periods: ps.map(
                      (p) =>
                        ({
                          duration: p.duration,
                          periodStart: p.period_start,
                          periodEnd: p.period_end,
                        } as EmotionPeriodInfo)
                    ),
                  } as EmotionInfo)
              );
              endSessionInfo = {
                emotions: sessionEmotionInfo,
                info: JSON.stringify(sessionDetectedResult.result),
              } as EndSessionInfo;
              endSession(sessionId, endSessionInfo)
                .then(() => {
                  setFrame(path.join(__dirname, '../resources/video.jpg'));
                  setCategoryList(null);
                  history.goBack();
                  dispatch(setShow(false));
                })
                .catch((error) => console.log(error));
            }
            break;
          default:
            break;
        }
      });
      if (!start && !kill) {
        const evidenceFolder = path.join(
          __dirname,
          `../evidences/session_${fourDigits(sessionId)}/`
        );
        COMMUNICATION_SOCKET.SOCKET.write(`start:${evidenceFolder}`);
        setStart(true);
      }
    }
  }, [start, kill]);

  const handleKill = () => {
    if (COMMUNICATION_SOCKET.SOCKET) {
      COMMUNICATION_SOCKET.SOCKET.write('end');
      setStart(false);
      setKill(true);
    }
    needRetryConnect.value = false;
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerWrapper}>
        <h4 className={styles.title}>
          <span>ESMS</span>
          Workspace
        </h4>
        <div>
          <button
            type="button"
            className={styles.completeSessionBtn}
            onClick={() => handleKill()}
          >
            Complete Session
          </button>
        </div>
      </div>
      <div className={styles.workspaceWrapper}>
        <div className={styles.leftWrapper}>
          <div className={styles.cameraWrapper}>
            <img alt="VideoImage" className={styles.cameraImage} src={frame} />
          </div>
          <div className={styles.taskWrapper}>
            <div className={styles.taskTitleWrapper}>
              <span className={styles.taskTitle}>Available Tasks</span>
            </div>
            <div className={styles.categoryTaskWrapper}>
              {categoryList && categoryList.length > 0 ? (
                categoryList.map((category) => (
                  <div className={styles.categoryWrapper} key={category.id}>
                    <div className={styles.categoryNameWrapper}>
                      <span className={styles.categoryName}>
                        {category.categoryName}
                      </span>
                    </div>
                    <ul>
                      {category.taskList && category.taskList.length > 0 ? (
                        category.taskList.map((task) => (
                          <li className={styles.taskNameWrapper} key={task.id}>
                            <span className={styles.taskName}>{task.name}</span>
                          </li>
                        ))
                      ) : (
                        <>
                          <div className="">No task available</div>
                        </>
                      )}
                    </ul>
                  </div>
                ))
              ) : (
                <>
                  <div className="">No category available</div>
                </>
              )}
            </div>
          </div>
        </div>
        <div className={styles.contentWrapper}>Xyz</div>
      </div>
    </div>
  );
}