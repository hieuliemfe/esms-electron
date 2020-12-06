/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable promise/always-return */
import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import { ipcRenderer } from 'electron';
import routes from './constants/routes.json';
import { history, configuredStore } from './store';
import {
  COMMUNICATION_SOCKET,
  COMMUNICATION_PORT,
  createClientSocket,
  handleComSocData,
} from './socket.dev';
import {
  addEviVideo,
  addEviPeriod,
  setLoggedIn,
  setComSocReady,
  setLastUpdateSession,
  setEvidencePath,
} from './features/home/homeSlice';
import request from './utils/request';
import './app.global.css';

const store = configuredStore();

COMMUNICATION_SOCKET.SOCKET = createClientSocket(
  COMMUNICATION_PORT,
  handleComSocData,
  () => true,
  () => {
    console.log(
      `[ELECTRON_RENDERER_PROCESS]: Connect success to port ${COMMUNICATION_PORT}`
    );
    store.dispatch(setComSocReady(true));
  }
);

ipcRenderer.on('signed-url', (event, objName, url) => {
  if (event && objName && url) {
    if (objName.startsWith('periods:')) {
      const realName = objName.substr(8);
      const GCS_ENDPOINT = 'https://storage.googleapis.com';
      if (url.startsWith(GCS_ENDPOINT)) {
        const resourcePath = url.substr(GCS_ENDPOINT.length);
        request
          .get(resourcePath, undefined, false, GCS_ENDPOINT)
          .then((json) => {
            console.log('json', json);
            let arrPeriod: any[] = json as any[];
            if (arrPeriod && arrPeriod.length > 0) {
              const sum = arrPeriod.reduce((s, e) => {
                const sm = s + e.duration;
                return sm;
              }, 0);
              console.log('sum', sum);
              arrPeriod = arrPeriod.filter((e) => e.duration > 1000);
              arrPeriod.forEach((e, i) => {
                e.no = i + 1;
              });
              arrPeriod = arrPeriod.sort((a, b) => b.duration - a.duration);
            }
            store.dispatch(addEviPeriod({ [realName]: arrPeriod }));
          })
          .catch(console.log);
      }
    }
    store.dispatch(addEviVideo({ [objName]: url }));
  }
});

ipcRenderer.on('retrieved-result', (event, objName, result) => {
  if (event && objName && result) {
    console.log('result', result);
    let arrPeriod: any[] = result as any[];
    if (arrPeriod && arrPeriod.length > 0) {
      arrPeriod = arrPeriod.filter((e) => e.duration > 1000);
      arrPeriod.forEach((e, i) => {
        e.no = i + 1;
      });
      arrPeriod = arrPeriod.sort((a, b) => b.duration - a.duration);
    }
    store.dispatch(addEviPeriod({ [objName]: arrPeriod }));
  }
});

ipcRenderer.on('suspension-warning-dialog-closed', (event) => {
  if (event) {
    const isRelaxMode = store.getState().login.relaxMode;
    if (isRelaxMode) {
      ipcRenderer.send('login-success');
      history.push(routes.HOME);
    }
  }
});

ipcRenderer.on('exit-relax-mode-dialog-closed', (event) => {
  if (event) {
    const isRelaxMode = store.getState().login.relaxMode;
    if (isRelaxMode) {
      store.dispatch(setLoggedIn(false));
    }
  }
});

ipcRenderer.on('uploaded-session-result', (event) => {
  if (event) {
    store.dispatch(setLastUpdateSession(Date.now()));
  }
});

ipcRenderer.on('evidence-path', (event, eviPath) => {
  if (event && eviPath) {
    store.dispatch(setEvidencePath(eviPath));
  }
});

const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;

document.addEventListener('DOMContentLoaded', () => {
  // eslint-disable-next-line global-require
  const Root = require('./containers/Root').default;
  render(
    <AppContainer>
      <Root store={store} history={history} />
    </AppContainer>,
    document.getElementById('root')
  );
});
