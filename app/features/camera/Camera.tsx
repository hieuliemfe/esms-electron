import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import styles from './Camera.css';
import routes from '../../constants/routes.json';
import { updateFrame, selectFrame } from './cameraSlice';

export default function Camera() {
  const dispatch = useDispatch();
  const frame = useSelector(selectFrame);
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log(typeof process);
    // eslint-disable-next-line no-console
    console.log(process);
    dispatch(updateFrame('Hi There'));
  });
  return (
    <div>
      <div className={styles.backButton} data-tid="backButton">
        <Link to={routes.HOME}>
          <i className="fa fa-arrow-left fa-3x" />
        </Link>
      </div>
      <div className={`counter ${styles.counter}`} data-tid="counter">
        {frame}
      </div>
    </div>
  );
}
