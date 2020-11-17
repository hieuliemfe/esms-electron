/* eslint-disable promise/always-return */
import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import { ipcRenderer } from 'electron';
import { history, configuredStore } from './store';
import runChildProcess from './socket.dev';
import { addEviVideo, addEviPeriod } from './features/home/homeSlice';
import request from './utils/request';
import './app.global.css';

runChildProcess();

const store = configuredStore();

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
            store.dispatch(addEviPeriod({ [realName]: json }));
          })
          .catch(console.log);
      }
    }
    store.dispatch(addEviVideo({ [objName]: url }));
  }
});

ipcRenderer.on('retrieved-result', (event, objName, result) => {
  if (event && objName && result) {
    store.dispatch(addEviPeriod({ [objName]: result }));
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
