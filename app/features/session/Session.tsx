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
import { ipcRenderer } from 'electron';
import {
  EmotionData,
  EmotionPeriodData,
  EndSessionData,
} from '../../services/sessions';
import { getCounter } from '../../services/counters';
import { CategoryInfo, ServiceInfo } from '../../services/categories';
import {
  setSessionDetectedResult,
  selectSessionId,
  SessionDetectedInfo,
} from './sessionSlice';
import { selectEvidencePath, selectCustomerName } from '../home/homeSlice';
import { selectCounterId } from '../login/loginSlice';
import { setLoading } from '../../components/loading-bar/loadingBarSlice';
import {
  createClientSocket,
  setComSocHandler,
  COMMUNICATION_SOCKET,
  // PYTHON_VENV_PATH,
} from '../../socket.dev';
import styles from './Session.css';
import videoLogo from '../../assets/video.jpg';

const twoDigits = (num: number | string) => `${`0${num}`.substr(-2)}`;

const fourDigits = (num: number | string) =>
  num > 999 ? num : `${`000${num}`.substr(-4)}`;

const getClientDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return `${twoDigits(date.getDate())}/${twoDigits(
    date.getMonth() + 1
  )}/${date.getFullYear()}`;
};

export default function Session() {
  const dispatch = useDispatch();
  const counterId = useSelector(selectCounterId);
  const sessionId = useSelector(selectSessionId);
  const evidencePath = useSelector(selectEvidencePath);
  const customerName = useSelector(selectCustomerName);
  const history = useHistory();
  const [categoryList, setCategoryList] = useState<
    CategoryInfo[] | undefined
  >();
  const [selectedCategory, setSelectedCategory] = useState<
    CategoryInfo | undefined
  >();
  const [serviceList, setServiceList] = useState<ServiceInfo[] | undefined>();
  const [filteredServiceList, setFilteredServiceList] = useState<
    ServiceInfo[] | undefined
  >();
  const [selectedServiceName, setSelectedServiceName] = useState<
    string | undefined
  >();
  const [frame, setFrame] = useState(videoLogo);
  const [needRetryConnect] = useState({ value: true });
  const [start, setStart] = useState(false);
  const [kill, setKill] = useState(false);
  const evidenceFoldername = `session_${fourDigits(sessionId)}/`;
  const evidenceFolder = path.join(evidencePath, `./${evidenceFoldername}`);
  const [isShowForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      currency: 'VND',
      valdate: getClientDate(new Date().toJSON()),
      aname: customerName || 'Nguyen Hieu Liem',
      aaccnum: 65010001234569,
    },
  });
  const [isShowWarning, setShowWarning] = useState(false);
  const [isShowCustomerInfo, setShowCustomerInfo] = useState(false);
  let sessionDetectedResult: SessionDetectedInfo;
  let sessionEmotionInfo: EmotionData[] = [];
  let endSessionInfo: EndSessionData;

  const selectService = (serviceName: string) => {
    setSelectedServiceName(serviceName);
    setShowForm(true);
  };

  const cancelService = () => {
    setShowForm(false);
  };

  const searchCustomer = async () => {
    dispatch(setLoading(true));
    await new Promise(() => {
      setTimeout(() => {
        dispatch(setLoading(false));
        setShowCustomerInfo(true);
      }, 1000);
    });
  };

  const searchService = (event: any) => {
    const searchValue = event.target.value.trim();
    if (selectedCategory) {
      setSelectedCategory(undefined);
    }
    if (searchValue && serviceList && serviceList.length > 0) {
      setFilteredServiceList(
        serviceList.filter((service) =>
          service.name.toLowerCase().includes(searchValue.toLowerCase())
        )
      );
    }
  };

  const toggleSelectedCategory = (category: CategoryInfo) => {
    if (!selectedCategory || selectedCategory.id !== category.id) {
      setSelectedCategory(category);
      setFilteredServiceList(category.Services);
    } else {
      setSelectedCategory(undefined);
      setFilteredServiceList(undefined);
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
          const { counters } = getCounterResponse.message;
          if (counters) {
            const catList: CategoryInfo[] | undefined = counters.Categories;
            if (catList && catList.length > 0) {
              let svList: ServiceInfo[] = [];
              catList.forEach((cat) => {
                if (cat.Services) {
                  svList = [...svList, ...cat.Services];
                }
              });
              setCategoryList(catList);
              setServiceList(svList);
              dispatch(setLoading(false));
            }
          }
        }
      })
      .catch((error) => console.log(error));
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
                setShowWarning(!!response.is_warning);
                setFrame(`data:image/png;base64,${response.img_src}`);
              },
              () => {
                if (!needRetryConnect.value) {
                  setFrame(videoLogo);
                }
                return needRetryConnect.value;
              }
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
                        } as EmotionPeriodData)
                    ),
                  } as EmotionData)
              );
              endSessionInfo = {
                emotions: sessionEmotionInfo,
                info: JSON.stringify(sessionDetectedResult.result),
              } as EndSessionData;
              ipcRenderer.send('upload-session-result', endSessionInfo);
              needRetryConnect.value = false;
              dispatch(setLoading(false));
              history.goBack();
            }
            break;
          default:
            break;
        }
      });
      if (!start && !kill) {
        COMMUNICATION_SOCKET.SOCKET.write(`start:${evidenceFolder}`);
        setStart(true);
      }
    }
  }, [start, kill]);

  const handleKill = () => {
    dispatch(setLoading(true));
    if (COMMUNICATION_SOCKET.SOCKET) {
      COMMUNICATION_SOCKET.SOCKET.write('end');
      setStart(false);
      setKill(true);
    }
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
            <img
              alt="VideoImage"
              className={styles.cameraImage}
              src={frame}
              draggable={false}
            />
          </div>
          <div className={styles.angryWrapper}>
            <div className={styles.angryTitleWrapper}>
              <span className={styles.angryTitle}>Session Information</span>
            </div>
            <div className={styles.angryListWrapper}>
              <div className={styles.searchCustomerWrapper}>
                <input
                  type="text"
                  className={styles.searchCusInput}
                  placeholder="Search for Customer"
                />
                <div
                  className={styles.searchCustomerBtnWrp}
                  onClick={() => searchCustomer()}
                >
                  <i className="fas fa-search" />
                </div>
              </div>
              {isShowCustomerInfo ? (
                <>
                  <div className={styles.formBlockFull}>
                    <span className={styles.formSubtitle}>Full Name</span>
                    <div
                      className={`${styles.formBlock} ${styles.formBlockFull} ${styles.flexEnd}`}
                    >
                      <span className={styles.cusInfo}>
                        {`${customerName || 'Nguyen Hieu Liem'}`}
                      </span>
                    </div>
                  </div>
                  <div className={styles.formBlockFull}>
                    <span className={styles.formSubtitle}>ID Card</span>
                    <div
                      className={`${styles.formBlock} ${styles.formBlockFull} ${styles.flexEnd}`}
                    >
                      <span className={styles.cusInfo}>281123654</span>
                    </div>
                  </div>
                  <div className={styles.formBlockFull}>
                    <span className={styles.formSubtitle}>Account Number</span>
                    <div
                      className={`${styles.formBlock} ${styles.formBlockFull} ${styles.flexEnd}`}
                    >
                      <span className={styles.cusInfo}>65010001234569</span>
                    </div>
                  </div>
                  <div className={styles.formBlockFull}>
                    <span className={styles.formSubtitle}>Phone</span>
                    <div
                      className={`${styles.formBlock} ${styles.formBlockFull} ${styles.flexEnd}`}
                    >
                      <span className={styles.cusInfo}>0946913679</span>
                    </div>
                  </div>
                </>
              ) : (
                <></>
              )}
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
                    onInput={(ev) => searchService(ev)}
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
                                  {category.subtitle}
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
                  {filteredServiceList ? (
                    <div className={styles.listTaskInner}>
                      {filteredServiceList.length > 0 ? (
                        filteredServiceList.map((service) => (
                          <div
                            className={styles.listTaskItemWrapper}
                            key={service.id}
                            onClick={() => selectService(service.name)}
                          >
                            <div className={styles.listTaskItem}>
                              <i
                                className={`fas fa-tasks ${styles.listTaskItemIcon}`}
                              />
                              <div className={styles.listTaskItemContent}>
                                <span className={styles.listTaskItemTitle}>
                                  {service.name}
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
              <span className={styles.formTitle}>{selectedServiceName}</span>
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
                          <span
                            className={`${styles.fieldLabel} ${styles.requiredField}`}
                          >
                            Currency:
                          </span>
                          <input
                            ref={register({ required: true })}
                            type="text"
                            name="currency"
                            style={{ width: 70 }}
                            className={styles.fieldInput}
                          />
                        </div>
                        <div className={styles.fieldWrapper}>
                          <span
                            className={`${styles.fieldLabel} ${styles.requiredField}`}
                          >
                            Amount in Figures:
                          </span>
                          <input
                            ref={register({ required: true })}
                            type="number"
                            name="amountF"
                            style={{ width: 200 }}
                            className={styles.fieldInput}
                          />
                        </div>
                        <div className={styles.fieldWrapper}>
                          <span
                            className={`${styles.fieldLabel} ${styles.requiredField}`}
                          >
                            Amount in Words:
                          </span>
                          <input
                            ref={register({ required: true })}
                            type="text"
                            name="amountW"
                            style={{ width: '30vw' }}
                            className={styles.fieldInput}
                          />
                        </div>
                        <div className={styles.fieldWrapper}>
                          <span
                            className={`${styles.fieldLabel} ${styles.requiredField}`}
                          >
                            Value Date:
                          </span>
                          <input
                            ref={register({ required: true })}
                            type="text"
                            name="valdate"
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
                          <span
                            className={`${styles.fieldLabel} ${styles.requiredField}`}
                          >
                            Name and Address of Beneficiary&apos;s Bank:
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
                          <span
                            className={`${styles.fieldLabel} ${styles.requiredField}`}
                          >
                            Name:
                          </span>
                          <input
                            ref={register({ required: true })}
                            type="text"
                            name="bname"
                            style={{ width: '90%' }}
                            className={styles.fieldInput}
                          />
                        </div>
                        <div className={styles.fieldWrapper}>
                          <span
                            className={`${styles.fieldLabel} ${styles.requiredField}`}
                          >
                            Account Number:
                          </span>
                          <input
                            ref={register({ required: true })}
                            type="number"
                            name="baccnum"
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
                            Relationship with applicant:
                          </span>
                          <input
                            ref={register()}
                            type="text"
                            name="brelaa"
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
                          <span
                            className={`${styles.fieldLabel} ${styles.requiredField}`}
                          >
                            Name:
                          </span>
                          <input
                            ref={register({ required: true })}
                            type="text"
                            name="aname"
                            style={{ width: '90%' }}
                            className={styles.fieldInput}
                          />
                        </div>
                        <div className={styles.fieldWrapper}>
                          <span
                            className={`${styles.fieldLabel} ${styles.requiredField}`}
                          >
                            Account Number:
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
                            Transaction Remark:
                          </span>
                          <textarea
                            ref={register()}
                            rows={3}
                            name="remark"
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
                    <span className={styles.required}>*</span>
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
                          ref={register({ required: true })}
                          id="localRe"
                          type="checkbox"
                          name="local"
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
                          name="local"
                          className={styles.checkboxInput}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.formBlockHalf}>
                  <span className={styles.formSubtitle}>
                    <span className={styles.required}>*</span>
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
                          ref={register({ required: true })}
                          id="overRe"
                          type="checkbox"
                          name="over"
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
                          name="over"
                          className={styles.checkboxInput}
                        />
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
                      onClick={() => cancelService()}
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
