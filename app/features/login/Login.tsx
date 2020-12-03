/* eslint-disable jsx-a11y/no-autofocus */
import React from 'react';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import path from 'path';
import { ipcRenderer } from 'electron';
import { useHistory } from 'react-router-dom';
import routes from '../../constants/routes.json';
import { login, getProfile, ProfileInfo } from '../../services/root';
import { setLoading } from '../../components/loading-bar/loadingBarSlice';
import { setLoggedIn } from '../home/homeSlice';
import {
  setToken,
  setUserProfile,
  setCounterId,
  setRelaxMode,
  setSuspension,
} from './loginSlice';
import {
  setToken as setRequestToken,
  ResponseError,
} from '../../utils/request';
import styles from './Login.css';

export default function Login() {
  const dispatch = useDispatch();
  const { register, handleSubmit } = useForm();
  const history = useHistory();
  const logo = path.join(__dirname, '../resources/esms_logo300.png');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    try {
      dispatch(setLoading(true));
      const loginResponse = await login(data.empCode, data.empPass);
      if (loginResponse) {
        if (loginResponse.success) {
          dispatch(setToken(loginResponse.token));
          setRequestToken(loginResponse.token);
          ipcRenderer.send('store-token', loginResponse.token);

          const profileResponse = await getProfile();
          if (profileResponse.success) {
            const profileInfo: ProfileInfo = profileResponse.message;
            dispatch(setUserProfile(profileInfo));
            dispatch(setCounterId(profileInfo.counterId));
            dispatch(setLoggedIn(true));
            ipcRenderer.send('login-success');
            history.push(routes.HOME);
          }
        }
      }
    } catch (error) {
      const resErr: ResponseError = error as ResponseError;
      const dataErr = await resErr.response.json();
      const { token } = dataErr;
      const empErr = dataErr.message;
      if (typeof empErr === 'string') {
        ipcRenderer.send('login-failed', empErr);
      } else {
        dispatch(setToken(token));
        setRequestToken(token);
        ipcRenderer.send('store-token', token);
        console.log('token', token);
        console.log('empErr', empErr);

        const profileResponse = await getProfile();
        if (profileResponse.success) {
          const profileInfo: ProfileInfo = profileResponse.message;
          dispatch(setUserProfile(profileInfo));
          dispatch(setCounterId(profileInfo.counterId));
          const { suspensions } = empErr;
          if (suspensions && suspensions[0]) {
            const suspension = suspensions[0];
            dispatch(setSuspension(suspension));
            console.log('suspension', suspension);
            const message = `Your account is temporarily suspended due to some of your improper behaviors. You are now redirected to Relax Mode!`;
            dispatch(setRelaxMode(true));
            dispatch(setLoggedIn(true));
            ipcRenderer.send('suspension-warning', message);
          }
        }
      }
    } finally {
      dispatch(setLoading(false));
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
