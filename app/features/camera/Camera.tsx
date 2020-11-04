import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import path from 'path';
import styles from './Camera.css';
import routes from '../../constants/routes.json';
import {
  createClientSocket,
  setComSocHandler,
  COMMUNICATION_SOCKET,
} from '../../socket.dev';

export const clientState = {
  needRetryConnect: true,
};

export default function Camera() {
  const [frame, setFrame] = useState(
    path.join(__dirname, '../resources/video.jpg')
  );
  const [start, setStart] = useState(false);
  const [kill, setKill] = useState(false);

  useEffect(() => {
    if (COMMUNICATION_SOCKET.SOCKET) {
      setComSocHandler((payload: string) => {
        console.log('payload', payload);
        const type = payload.substring(0, payload.indexOf(':'));
        const dataStr = payload.substring(payload.indexOf(':') + 1);
        console.log('type', type);
        switch (type) {
          case 'StreamPort':
            createClientSocket(
              Number.parseInt(dataStr, 10),
              (data: string) => {
                if (data[0] === '{') {
                  const response = JSON.parse(data);
                  setFrame(`data:image/png;base64,${response.img_src}`);
                }
              },
              () => clientState.needRetryConnect
            );
            break;
          case 'SessionResult':
            setFrame(path.join(__dirname, '../resources/video.jpg'));
            break;
          default:
            break;
        }
      });
      if (!start && !kill) {
        const evidenceFolder = path.join(
          __dirname,
          '../evidences/session_test/'
        );
        COMMUNICATION_SOCKET.SOCKET.write(`start:${evidenceFolder}`);
        setStart(true);
      }
    }
  }, [start, kill]);

  const handleKill = () => {
    if (COMMUNICATION_SOCKET.SOCKET) {
      COMMUNICATION_SOCKET.SOCKET.write('end');
      setStart(false);
      setKill(true);
    }
    clientState.needRetryConnect = false;
  };

  return (
    <div>
      <div className={styles.backButton}>
        <Link to={routes.HOME}>
          <i className="fa fa-arrow-left fa-3x" />
        </Link>
      </div>
      <img alt="VideoImage" className={styles.image} src={frame} />
      <div className={styles.btnGroup}>
        <button
          className={styles.btn}
          onClick={() => handleKill()}
          type="button"
        >
          kill
        </button>
      </div>
    </div>
  );
}
