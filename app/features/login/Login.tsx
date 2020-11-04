/* eslint-disable jsx-a11y/no-autofocus */
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import path from 'path';
import { ipcRenderer } from 'electron';
import { useHistory } from 'react-router-dom';
import routes from '../../constants/routes.json';
import { login, getProfile } from '../../services/root';
import { getActiveShift } from '../../services/shifts';
import {
  setToken,
  setUserProfile,
  setCounterId,
  setShiftId,
} from './loginSlice';
import { setToken as setRequestToken } from '../../utils/request';
import styles from './Login.css';

export default function Login() {
  const dispatch = useDispatch();
  const { register, handleSubmit } = useForm();
  const history = useHistory();
  const [logo] = useState(path.join(__dirname, '../resources/esms_logo.png'));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    try {
      const loginResponse = await login(data.empCode, data.empPass);
      if (loginResponse) {
        if (loginResponse.status) {
          dispatch(setToken(loginResponse.token));
          setRequestToken(loginResponse.token);

          const profileResponse = await getProfile();
          if (profileResponse.status) {
            dispatch(setUserProfile(profileResponse.message));

            const activeShiftResponse = await getActiveShift();
            if (activeShiftResponse.status) {
              const activeShift = activeShiftResponse.message;
              ipcRenderer.send('login-success');
              if (activeShift && activeShift.length > 0) {
                const { counterId, id: shiftId } = activeShift[0];
                dispatch(setCounterId(counterId));
                dispatch(setShiftId(shiftId));
                history.push(routes.WAITING_LIST);
              } else {
                history.push(routes.CHECKIN);
              }
            }
          }
        }
      }
    } catch (error) {
      ipcRenderer.send('login-failed');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.logoWrapper}>
        <img className={styles.logoImage} src={logo} alt="ESMSLogo" />
      </div>
      <div className={styles.loginFormWrapper}>
        <h4 className={styles.title}>
          Login to
          <span>ESMS</span>
        </h4>
        <form className={styles.formLogin} onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.fieldWrapper}>
            <span className={styles.fieldLabel}>Employee Code</span>
            <input
              ref={register({ required: true })}
              type="text"
              name="empCode"
              className={styles.fieldInput}
              autoFocus
            />
          </div>
          <div className={styles.fieldWrapper}>
            <span className={styles.fieldLabel}>Password</span>
            <input
              ref={register({ required: true })}
              type="password"
              name="empPass"
              className={styles.fieldInput}
            />
          </div>
          <div className={styles.fieldWrapper}>
            <input type="submit" className={styles.btnLogin} value="Login" />
          </div>
        </form>
      </div>
    </div>
  );
}
