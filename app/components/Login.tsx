/* eslint-disable jsx-a11y/no-autofocus */
import React from 'react';
import { useForm } from 'react-hook-form';
import routes from '../constants/routes.json';
import { login } from '../services/root';
import styles from './Login.css';
import logo from '../../resources/esms_logo.png';

export default function Login(): JSX.Element {
  const { register, handleSubmit } = useForm();
  // const { dialog } = require('electron').remote;
  // console.log('dialog', dialog);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    try {
      const response = await login(data.empCode, data.empPass);
      console.log(response);
    } catch (error) {
      console.log(error);
      // dialog.showErrorBox(
      //   'Login FAILED',
      //   'Incorrect Employee Code or Password'
      // );
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
