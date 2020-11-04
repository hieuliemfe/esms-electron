import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import { selectToken, selectUserProfile } from '../features/login/loginSlice';
import { getToken } from '../utils/request';
import styles from './Home.css';

export default function Home(): JSX.Element {
  const token = useSelector(selectToken);
  const userProfile = useSelector(selectUserProfile);
  const requestToken = getToken();
  console.log('HomePage select token', token);
  console.log('HomePage select userProfile', userProfile);
  console.log('HomePage get requestToken', requestToken);
  return (
    <div className={styles.container}>
      <h2>Hello Home</h2>
    </div>
  );
}
