import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import { ipcRenderer } from 'electron';
import { history, configuredStore } from './store';
import runChildProcess from './socket.dev';
import { addEviVideo } from './features/home/homeSlice';
import './app.global.css';

runChildProcess();

const store = configuredStore();

ipcRenderer.on('signed-url', (event, result) => {
  if (event && result) {
    store.dispatch(addEviVideo(result));
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
