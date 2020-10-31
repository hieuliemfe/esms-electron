import React from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import styles from './Home.css';

export default function Home(): JSX.Element {
  return (
    <div className={styles.container}>
      <h2>Home</h2>
      <p>
        <Link to={routes.COUNTER}>to Counter</Link>
      </p>
      <p>
        <Link to={routes.CAMERA}>to Camera</Link>
      </p>
    </div>
  );
}
