/* eslint-disable promise/always-return */
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
import { setToken, setUserProfile, setCounterId } from './loginSlice';
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

          const profileResponse = await getProfile();
          if (profileResponse.success) {
            const profileInfo: ProfileInfo = profileResponse.message;
            ipcRenderer.send('login-success');
            dispatch(setUserProfile(profileInfo));
            dispatch(setCounterId(profileInfo.counterId));
            history.push(routes.HOME);
          }
        }
      }
    } catch (error) {
      const resErr: ResponseError = error as ResponseError;
      resErr.response
        .json()
        .then((dataErr) => {
          const empErr = dataErr.message;
          if (typeof empErr === 'string') {
            ipcRenderer.send('login-failed', empErr);
          } else {
            const { suspensions } = empErr;
            if (suspensions && suspensions[0]) {
              const suspension = suspensions[0];
              const expiration = new Date(suspension.expiredOn);
              const message = `Your account is temporarily suspended until ${expiration.getDate()}/${
                expiration.getMonth() + 1
              }/${expiration.getFullYear()} at ${expiration.getHours()}:${expiration.getMinutes()}:${expiration.getSeconds()} due to some of your improper behavior. You should take a break and come back later!`;
              ipcRenderer.send('login-failed', message);
            }
          }
        })
        .catch(console.log);
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
