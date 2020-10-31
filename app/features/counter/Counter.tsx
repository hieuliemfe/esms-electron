import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import styles from './Counter.css';
import routes from '../../constants/routes.json';
import {
  increment,
  decrement,
  incrementIfOdd,
  incrementAsync,
  selectCount,
} from './counterSlice';

export default function Counter() {
  const dispatch = useDispatch();
  const value = useSelector(selectCount);
  return (
    <div>
      <div className={styles.backButton}>
        <Link to={routes.HOME}>
          <i className="fa fa-arrow-left fa-3x" />
        </Link>
      </div>
      <div className={`counter ${styles.counter}`}>{value}</div>
      <div className={styles.btnGroup}>
        <button
          className={styles.btn}
          onClick={() => {
            dispatch(increment());
          }}
          type="button"
        >
          <i className="fa fa-plus" />
        </button>
        <button
          className={styles.btn}
          onClick={() => {
            dispatch(decrement());
          }}
          type="button"
        >
          <i className="fa fa-minus" />
        </button>
        <button
          className={styles.btn}
          onClick={() => {
            dispatch(incrementIfOdd());
          }}
          type="button"
        >
          odd
        </button>
        <button
          className={styles.btn}
          onClick={() => {
            dispatch(incrementAsync());
          }}
          type="button"
        >
          async
        </button>
      </div>
    </div>
  );
}
