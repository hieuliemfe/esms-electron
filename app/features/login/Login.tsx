/* eslint-disable jsx-a11y/no-autofocus */
import React from 'react';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { ipcRenderer } from 'electron';
import { useHistory } from 'react-router-dom';
import routes from '../../constants/routes.json';
import { login } from '../../services/root';
import { setToken, setUserInfo } from './loginSlice';
import { setToken as setRequestToken } from '../../utils/request';
import styles from './Login.css';
import logo from '../../../resources/esms_logo.png';

export default function Login() {
  const dispatch = useDispatch();
  const { register, handleSubmit } = useForm();
  const history = useHistory();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    try {
      const response = await login(data.empCode, data.empPass);
      if (response) {
        if (response.status) {
          dispatch(setUserInfo(JSON.parse(JSON.stringify(response.message))));
          dispatch(setToken(response.token));
          setRequestToken(response.token);
          ipcRenderer.send('login-success');
          history.push(routes.HOME);
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
