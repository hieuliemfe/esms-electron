/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable promise/always-return */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import path from 'path';
import { spawn } from 'child_process';
import {
  startSession,
  endSession,
  EmotionData,
  EmotionPeriodData,
  EndSessionData,
} from '../../services/sessions';
import { getCounter, CounterInfo } from '../../services/counters';
import { CategoryInfo, TaskInfo } from '../../services/categories';
import {
  setSessionDetectedResult,
  selectSessionId,
  SessionDetectedInfo,
} from './sessionSlice';
import { setLastUpdateSession } from '../home/homeSlice';
import { selectCounterId } from '../login/loginSlice';
import { setLoading } from '../../components/loading-bar/loadingBarSlice';
import {
  createClientSocket,
  setComSocHandler,
  COMMUNICATION_SOCKET,
  DETECTION_PATH,
  PYTHON_VENV_PATH,
} from '../../socket.dev';
import styles from './Session.css';

const fourDigits = (num: number | string) => `${`000${num}`.substr(-4)}`;

export default function Session() {
  const dispatch = useDispatch();
  const counterId = useSelector(selectCounterId);
  const sessionId = useSelector(selectSessionId);
  const history = useHistory();
  const [categoryList, setCategoryList] = useState<
    CategoryInfo[] | undefined
  >();
  const [selectedCategory, setSelectedCategory] = useState<
    CategoryInfo | undefined
  >();
  const [taskList, setTaskList] = useState<TaskInfo[] | undefined>();
  const [filteredTaskList, setFilteredTaskList] = useState<
    TaskInfo[] | undefined
  >();
  const [selectedTaskName, setSelectedTaskName] = useState<
    string | undefined
  >();
  const [frame, setFrame] = useState(
    path.join(__dirname, '../resources/video.jpg')
  );
  const [needRetryConnect] = useState({ value: true });
  const [start, setStart] = useState(false);
  const [kill, setKill] = useState(false);
  const evidenceFoldername = `session_${fourDigits(sessionId)}/`;
  const evidenceFolder = path.join(
    __dirname,
    `../evidences/${evidenceFoldername}`
  );
  const [isShowForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset } = useForm();
  const [isShowWarning, setShowWarning] = useState(false);
  let sessionDetectedResult: SessionDetectedInfo;
  const sessionEmotionInfo: EmotionData[] = [];
  let endSessionInfo: EndSessionData;

  const selectTask = (taskName: string) => {
    setSelectedTaskName(taskName);
    setShowForm(true);
  };

  const searchTask = (event: any) => {
    const searchValue = event.target.value.trim();
    if (selectedCategory) {
      setSelectedCategory(undefined);
    }
    if (searchValue && taskList && taskList.length > 0) {
      setFilteredTaskList(
        taskList.filter((task) =>
          task.name.toLowerCase().includes(searchValue.toLowerCase())
        )
      );
    }
  };

  const toggleSelectedCategory = (category: CategoryInfo) => {
    if (!selectedCategory || selectedCategory.id !== category.id) {
      setSelectedCategory(category);
      setFilteredTaskList(category.Tasks);
    } else {
      setSelectedCategory(undefined);
      setFilteredTaskList(undefined);
    }
  };

  const onSubmit = async () => {
    dispatch(setLoading(true));
    await new Promise(() => {
      setTimeout(() => {
        dispatch(setLoading(false));
        reset();
        setShowForm(false);
      }, 1000);
    });
  };

  useEffect(() => {
    dispatch(setLoading(true));
    getCounter(counterId)
      .then(async (getCounterResponse) => {
        if (getCounterResponse.success) {
          const { counter } = getCounterResponse.message;
          if (counter) {
            const catList: CategoryInfo[] | undefined = counter.Categories;
            if (catList && catList.length > 0) {
              let tsList: TaskInfo[] = [];
              catList.forEach((cat) => {
                if (cat.Tasks) {
                  tsList = [...tsList, ...cat.Tasks];
                }
              });
              setCategoryList(catList);
              setTaskList(tsList);
              dispatch(setLoading(false));
            }
          }
        }
      })
      .catch((error) => console.log(error));
    // startSession(sessionId).catch((error) => console.log(error));
  }, [counterId]);

  useEffect(() => {
    // if (COMMUNICATION_SOCKET.SOCKET) {
    //   setComSocHandler((payload: string) => {
    //     const eventType = payload.substring(0, payload.indexOf(':'));
    //     const dataStr = payload.substring(payload.indexOf(':') + 1);
    //     console.log('eventType', eventType);
    //     console.log('dataStr', dataStr);
    //     switch (eventType) {
    //       case 'StreamPort':
    //         createClientSocket(
    //           Number.parseInt(dataStr, 10),
    //           (data: string) => {
    //             const response = JSON.parse(data);
    //             setShowWarning(!!response.is_warning);
    //             setFrame(`data:image/png;base64,${response.img_src}`);
    //           },
    //           () => needRetryConnect.value
    //         );
    //         break;
    //       case 'SessionResult':
    //         sessionDetectedResult = JSON.parse(dataStr) as SessionDetectedInfo;
    //         dispatch(setSessionDetectedResult(sessionDetectedResult));
    //         if (
    //           sessionDetectedResult &&
    //           sessionDetectedResult.periods &&
    //           sessionDetectedResult.periods.length > 0
    //         ) {
    //           sessionEmotionInfo = sessionDetectedResult.periods.map(
    //             (ps, i) =>
    //               ({
    //                 emotion: i + 1,
    //                 periods: ps.map(
    //                   (p) =>
    //                     ({
    //                       duration: p.duration,
    //                       periodStart: p.period_start,
    //                       periodEnd: p.period_end,
    //                     } as EmotionPeriodData)
    //                 ),
    //               } as EmotionData)
    //           );
    //           endSessionInfo = {
    //             emotions: sessionEmotionInfo,
    //             info: JSON.stringify(sessionDetectedResult.result),
    //           } as EndSessionData;
    //           endSession(sessionId, endSessionInfo)
    //             .then(() => {
    //               setFrame(path.join(__dirname, '../resources/video.jpg'));
    //               setCategoryList(null);
    //               spawn(PYTHON_VENV_PATH, [
    //                 path.join(DETECTION_PATH, './upload.py'),
    //                 '--fr',
    //                 evidenceFolder.replace(/\\/g, '/'),
    //                 '--to',
    //                 evidenceFoldername,
    //               ])
    //                 .on('error', (err: Error) => {
    //                   console.error(
    //                     '[UPLOADER] Child process spawning error:',
    //                     err
    //                   );
    //                 })
    //                 .unref();
    //               dispatch(setLastUpdateSession(Date.now()));
    //               history.goBack();
    //             })
    //             .catch((error) => console.log(error));
    //         }
    //         break;
    //       default:
    //         break;
    //     }
    //   });
    //   if (!start && !kill) {
    //     COMMUNICATION_SOCKET.SOCKET.write(`start:${evidenceFolder}`);
    //     setStart(true);
    //   }
    // }
  }, [start, kill]);

  const handleKill = () => {
    history.goBack();
    // if (COMMUNICATION_SOCKET.SOCKET) {
    //   COMMUNICATION_SOCKET.SOCKET.write('end');
    //   setStart(false);
    //   setKill(true);
    // }
    // needRetryConnect.value = false;
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerWrapper}>
        <h4 className={styles.title}>
          <span>ESMS</span>
          Workspace
        </h4>
        {isShowWarning ? (
          <span className={styles.warningText}>
            BE CAREFUL! Your expression seems like critically negative!
          </span>
        ) : (
          <></>
        )}
        <div>
          <button
            type="button"
            className={styles.completeSessionBtn}
            onClick={() => handleKill()}
          >
            <i className="fas fa-clipboard-check" />
            Complete Session
          </button>
        </div>
      </div>
      <div className={styles.workspaceWrapper}>
        <div className={styles.leftWrapper}>
          <div className={styles.cameraWrapper}>
            <img alt="VideoImage" className={styles.cameraImage} src={frame} />
          </div>
          <div className={styles.angryWrapper}>
            <div className={styles.angryTitleWrapper}>
              <span className={styles.angryTitle} />
            </div>
          </div>
        </div>
        <div
          className={`${styles.contentWrapper} ${
            isShowForm ? styles.showForm : ''
          }`}
        >
          <div className={styles.contentLeftWrapper}>
            <div className={styles.contentLeftInner}>
              <div className={styles.searchWrapper}>
                <div className={styles.searchBoxWrapper}>
                  <input
                    type="text"
                    placeholder="Find a service"
                    onInput={(ev) => searchTask(ev)}
                  />
                  <i className="fas fa-search" />
                </div>
                <div className={styles.listCategoryWrapper}>
                  {categoryList ? (
                    <div className={styles.listCategoryInner}>
                      {categoryList.length > 0 ? (
                        categoryList.map((category) => (
                          <div
                            className={styles.listCategoryItemWrapper}
                            key={category.id}
                            onClick={() => toggleSelectedCategory(category)}
                          >
                            <div
                              className={`${styles.listCategoryItem} ${
                                selectedCategory &&
                                category.id === selectedCategory.id
                                  ? styles.selected
                                  : ''
                              }`}
                            >
                              <i
                                className={`far fa-bookmark ${styles.listCategoryItemIcon}`}
                              />
                              <div className={styles.listCategoryItemContent}>
                                <span className={styles.listCategoryItemTitle}>
                                  {category.categoryName}
                                </span>
                                <span
                                  className={styles.listCategoryItemDescription}
                                >
                                  Subtitle here
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <></>
                      )}
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
                <div className={styles.searchDivider} />
              </div>
              <div className={styles.resultWrapper}>
                <div className={styles.listTaskWrapper}>
                  {filteredTaskList ? (
                    <div className={styles.listTaskInner}>
                      {filteredTaskList.length > 0 ? (
                        filteredTaskList.map((task) => (
                          <div
                            className={styles.listTaskItemWrapper}
                            key={task.id}
                            onClick={() => selectTask(task.name)}
                          >
                            <div className={styles.listTaskItem}>
                              <i
                                className={`fas fa-tasks ${styles.listTaskItemIcon}`}
                              />
                              <div className={styles.listTaskItemContent}>
                                <span className={styles.listTaskItemTitle}>
                                  {task.name}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <></>
                      )}
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className={styles.contentRightWrapper}>
            <div className={styles.contentRightInner}>
              <span className={styles.formTitle}>{selectedTaskName}</span>
              <span className={styles.formNote}>* mandatory field</span>
              <form
                className={styles.formWrapper}
                onSubmit={handleSubmit(onSubmit)}
              >
                <div className={styles.formBlockFull}>
                  <span className={styles.formSubtitle}>
                    <b>PAYMENT DETAILS</b>
                  </span>
                  <div className={styles.formSplit}>
                    <div
                      className={`${styles.formBlock} ${styles.formBlockFull}`}
                    >
                      <div className={styles.lineWrapper}>
                        <div className={styles.fieldWrapper}>
                          <span className={styles.fieldLabel}>*Currency:</span>
                          <input
                            ref={register({ required: true })}
                            type="text"
                            name="currency"
                            style={{ width: 70 }}
                            className={styles.fieldInput}
                          />
                        </div>
                        <div className={styles.fieldWrapper}>
                          <span className={styles.fieldLabel}>
                            *Amount in Figures:
                          </span>
                          <input
                            ref={register({ required: true })}
                            type="number"
                            name="amount"
                            style={{ width: 200 }}
                            className={styles.fieldInput}
                          />
                        </div>
                        <div className={styles.fieldWrapper}>
                          <span className={styles.fieldLabel}>
                            *Amount in Words:
                          </span>
                          <input
                            ref={register({ required: true })}
                            type="text"
                            name="amount"
                            style={{ width: '30vw' }}
                            className={styles.fieldInput}
                          />
                        </div>
                        <div className={styles.fieldWrapper}>
                          <span className={styles.fieldLabel}>
                            *Value Date:
                          </span>
                          <input
                            ref={register({ required: true })}
                            type="text"
                            name="amount"
                            style={{ width: 200 }}
                            className={styles.fieldInput}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.formBlockFull}>
                  <span className={styles.formSubtitle}>
                    <b>BENEFICIARY DETAILS</b>
                  </span>
                  <div className={styles.formSplit}>
                    <div
                      className={`${styles.formBlock} ${styles.formBlockFull}`}
                    >
                      <div className={styles.lineWrapper}>
                        <div className={styles.fieldWrapper}>
                          <span className={styles.fieldLabel}>*Name:</span>
                          <input
                            ref={register({ required: true })}
                            type="text"
                            name="bname"
                            style={{ width: '90%' }}
                            className={styles.fieldInput}
                          />
                        </div>
                        <div className={styles.fieldWrapper}>
                          <span className={styles.fieldLabel}>
                            Relationship with applicant:
                          </span>
                          <input
                            ref={register()}
                            type="text"
                            name="bname"
                            style={{ width: '90%' }}
                            className={styles.fieldInput}
                          />
                        </div>
                      </div>
                      <div className={styles.lineWrapper}>
                        <div className={styles.fieldWrapper}>
                          <span className={styles.fieldLabel}>
                            *Account Number:
                          </span>
                          <input
                            ref={register({ required: true })}
                            type="number"
                            name="accountnumber"
                            style={{ width: 200 }}
                            className={styles.fieldInput}
                          />
                        </div>
                      </div>
                      <div className={styles.lineWrapper}>
                        <div className={styles.fieldWrapper}>
                          <span className={styles.fieldLabel}>Address:</span>
                          <textarea
                            ref={register()}
                            rows={3}
                            name="baddress"
                            style={{ width: '100%' }}
                            className={styles.fieldInput}
                          />
                        </div>
                      </div>
                    </div>
                    <div
                      className={`${styles.formBlock} ${styles.formBlockFull}`}
                    >
                      <div className={styles.lineWrapper}>
                        <div className={styles.fieldWrapper}>
                          <span className={styles.fieldLabel}>
                            *Name and Address of Beneficiary&apos;s Bank:
                          </span>
                          <textarea
                            ref={register({ required: true })}
                            rows={3}
                            name="bnaddress"
                            style={{ width: '100%' }}
                            className={styles.fieldInput}
                          />
                        </div>
                      </div>
                      <div className={styles.lineWrapper}>
                        <div className={styles.fieldWrapper}>
                          <span className={styles.fieldLabel}>
                            Swift Code/Sort Code/Fed Wire/BSB No/BAN:
                          </span>
                          <input
                            ref={register({ required: true })}
                            type="number"
                            name="swiftcode"
                            style={{ width: 200 }}
                            className={styles.fieldInput}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.formBlockFull}>
                  <span className={styles.formSubtitle}>
                    <b>APPLICANT DETAILS</b>
                  </span>
                  <div className={styles.formSplit}>
                    <div
                      className={`${styles.formBlock} ${styles.formBlockFull}`}
                    >
                      <div className={styles.lineWrapper}>
                        <div className={styles.fieldWrapper}>
                          <span className={styles.fieldLabel}>*Name:</span>
                          <input
                            ref={register({ required: true })}
                            type="text"
                            name="aname"
                            style={{ width: '90%' }}
                            className={styles.fieldInput}
                          />
                        </div>
                        <div className={styles.fieldWrapper}>
                          <span className={styles.fieldLabel}>
                            *Account Number:
                          </span>
                          <input
                            ref={register({ required: true })}
                            type="number"
                            name="aaccnum"
                            style={{ width: 200 }}
                            className={styles.fieldInput}
                          />
                        </div>
                      </div>
                    </div>
                    <div
                      className={`${styles.formBlock} ${styles.formBlockFull}`}
                    >
                      <div className={styles.lineWrapper}>
                        <div className={styles.fieldWrapper}>
                          <span className={styles.fieldLabel}>
                            Remittance Informations:
                          </span>
                          <input
                            ref={register({ required: true })}
                            type="number"
                            name="swiftcode"
                            style={{ width: '100%' }}
                            className={styles.fieldInput}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.formBlockHalf}>
                  <span className={styles.formSubtitle}>
                    Local charges to be paid by:
                  </span>
                  <div
                    className={`${styles.formBlock} ${styles.formBlockFull} ${styles.flexCenter}`}
                  >
                    <div className={styles.lineWrapper}>
                      <div
                        className={`${styles.fieldWrapper} ${styles.checkbox}`}
                      >
                        <label htmlFor="localRe" className={styles.fieldLabel}>
                          Remitter
                        </label>
                        <input
                          ref={register()}
                          id="localRe"
                          type="checkbox"
                          name="aname"
                          className={styles.checkboxInput}
                        />
                      </div>
                      <div
                        className={`${styles.fieldWrapper} ${styles.checkbox}`}
                      >
                        <label htmlFor="localBe" className={styles.fieldLabel}>
                          Beneficiary
                        </label>
                        <input
                          ref={register({ required: true })}
                          id="localBe"
                          type="checkbox"
                          name="aname"
                          className={styles.checkboxInput}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.formBlockHalf}>
                  <span className={styles.formSubtitle}>
                    Overseas charges to be paid by:
                  </span>
                  <div
                    className={`${styles.formBlock} ${styles.formBlockFull} ${styles.flexCenter}`}
                  >
                    <div className={styles.lineWrapper}>
                      <div
                        className={`${styles.fieldWrapper} ${styles.checkbox}`}
                      >
                        <label htmlFor="overRe" className={styles.fieldLabel}>
                          Remitter
                        </label>
                        <input
                          ref={register()}
                          id="overRe"
                          type="checkbox"
                          name="aname"
                          className={styles.checkboxInput}
                        />
                      </div>
                      <div
                        className={`${styles.fieldWrapper} ${styles.checkbox}`}
                      >
                        <label htmlFor="overBe" className={styles.fieldLabel}>
                          Beneficiary
                        </label>
                        <input
                          ref={register({ required: true })}
                          id="overBe"
                          type="checkbox"
                          name="aname"
                          className={styles.checkboxInput}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.formBlockFull}>
                  <span className={styles.formSubtitle}>
                    <b>PURPOSE OF PAYMENT</b>
                  </span>
                  <div className={styles.formSplit}>
                    <div
                      className={`${styles.formBlock} ${styles.formBlockFull}`}
                    >
                      <div className={styles.lineWrapper}>
                        <div className={styles.fieldWrapper}>
                          <span className={styles.fieldLabel}>
                            Please describe the specific goods / services /
                            transaction for which the payment is to be made:
                          </span>
                          <textarea
                            ref={register()}
                            rows={3}
                            name="baddress"
                            style={{ width: '100%' }}
                            className={styles.fieldInput}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.lineWrapper}>
                  <div className={styles.fieldWrapper}>
                    <input
                      type="submit"
                      className={styles.btnDone}
                      value="SUBMIT"
                    />
                    <input
                      type="button"
                      className={styles.btnDone}
                      value="CANCEL"
                      onClick={() => setShowForm(false)}
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
