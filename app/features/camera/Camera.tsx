import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import path from 'path';
import net from 'net';
import styles from './Camera.css';
import routes from '../../constants/routes.json';
import { COMMUNICATION_SOCKET, COMSOC_HANDLERS } from '../../main.dev';

export const clientState = {
  needRetryConnect: true,
};

export const createClientSocket = async (
  port: number,
  callback: CallableFunction
) => {
  const client = new net.Socket();
  client.connect(port, 'localhost');
  client.on('data', (data: Buffer) => {
    callback(data.toString());
  });
  client.on('error', (err: Error) => {
    console.log('Error:', err);
  });
  client.on('close', () => {
    if (clientState.needRetryConnect) {
      client.connect(port, 'localhost');
    }
  });
};

export default function Camera() {
  const [frame, setFrame] = useState(
    path.join(__dirname, '../resources/video.jpg')
  );
  const [kill, setKill] = useState(false);

  useEffect(() => {
    if (COMMUNICATION_SOCKET) {
      COMSOC_HANDLERS.length = 0;
      COMSOC_HANDLERS.push((portStr: string) => {
        createClientSocket(Number.parseInt(portStr, 10), (data: string) => {
          setFrame(`data:image/jpeg;base64,${data}`);
        });
      });
      COMMUNICATION_SOCKET.emit('data', Buffer.from('start'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kill]);

  const handleKill = () => {
    setKill(true);
    COMSOC_HANDLERS.length = 0;
    COMSOC_HANDLERS.push((detectData: string) => {
      console.log('Detect data:', detectData);
    });
    COMMUNICATION_SOCKET.emit('data', Buffer.from('end'));
    clientState.needRetryConnect = false;
    setTimeout(() => {
      setFrame(path.join(__dirname, '../resources/video.jpg'));
      setKill(false);
    });
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
