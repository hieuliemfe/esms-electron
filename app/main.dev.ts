/* eslint-disable promise/always-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/no-dynamic-require */
/* eslint global-require: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import {
  app,
  ipcMain,
  dialog,
  BrowserWindow,
  Menu,
  IpcMainEvent,
} from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { spawn } from 'child_process';
import electronLocalshortcut from 'electron-localshortcut';
import { generateV4ReadSignedUrl } from './services/google-cloud';
import runChildProcess, {
  DETECTION_PATH,
  COMMUNICATION_PORT,
  createClientSocket,
} from './socket.dev';
import { API_ENDPOINT } from './utils/request';
// import MenuBuilder from './menu';

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

// const installExtensions = async () => {
//   const installer = require('electron-devtools-installer');
//   const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
//   const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

//   return Promise.all(
//     extensions.map((name) => installer.default(installer[name], forceDownload))
//   ).catch(console.log);
// };

// const RESOURCES_PATH = app.isPackaged
//   ? path.join(process.resourcesPath, 'resources')
//   : path.join(__dirname, '../resources');

// const getAssetPath = (...paths: string[]): string => {
//   return path.join(RESOURCES_PATH, ...paths);
// };

const createMainWindow = async () => {
  // if (
  //   process.env.NODE_ENV === 'development' ||
  //   process.env.DEBUG_PROD === 'true'
  // ) {
  //   await installExtensions();
  // }

  mainWindow = new BrowserWindow({
    show: false,
    width: 500,
    height: 290,
    resizable: false,
    maximizable: false,
    icon: path.join(__dirname, 'assets', 'esms_logo200.png'),
    webPreferences:
      (process.env.NODE_ENV === 'development' ||
        process.env.E2E_BUILD === 'true') &&
      process.env.ERB_SECURE !== 'true'
        ? {
            nodeIntegration: true,
          }
        : {
            // devTools: false,
            preload: path.join(__dirname, 'dist/renderer.prod.js'),
          },
  });

  mainWindow.loadURL(`file://${__dirname}/app.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.once('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.webContents.closeDevTools();
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('focus', () => {
    if (mainWindow) {
      electronLocalshortcut.register(
        mainWindow,
        ['CommandOrControl+R', 'CommandOrControl+Shift+R', 'F5'],
        () => {
          console.log('You pressed ctrl & R or F5');
        }
      );
    }
  });

  mainWindow.on('blur', () => {
    if (mainWindow) {
      electronLocalshortcut.unregisterAll(mainWindow);
    }
  });

  // const menuBuilder = new MenuBuilder(mainWindow);
  // menuBuilder.buildMenu();

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  // new AppUpdater();
  Menu.setApplicationMenu(null);
};

const createWindows = async () => {
  await createMainWindow();
};

/**
 * Add event listeners...
 */

const APP_BACKUP = { token: '', sessionId: 0 };

ipcMain.on('store-token', (event: IpcMainEvent, token: string) => {
  if (event && token) {
    APP_BACKUP.token = token;
  }
});

ipcMain.on('reset-token', () => {
  APP_BACKUP.token = '';
});

ipcMain.on('store-session-id', (event: IpcMainEvent, sessionId: number) => {
  if (event && sessionId) {
    APP_BACKUP.sessionId = sessionId;
  }
});

ipcMain.on('reset-session-id', () => {
  APP_BACKUP.sessionId = 0;
});

ipcMain.on('login-failed', (event: IpcMainEvent, message: string) => {
  if (event && message && mainWindow) {
    dialog.showMessageBoxSync(mainWindow, {
      title: 'Login FAILED',
      message,
      type: 'error',
    });
  }
});

ipcMain.on('suspension-warning', (event: IpcMainEvent, message: string) => {
  if (event && message && mainWindow) {
    dialog.showMessageBoxSync(mainWindow, {
      title: 'Suspension Warning',
      message,
      type: 'warning',
    });
    event.sender.send('suspension-warning-dialog-closed');
  }
});

ipcMain.on('exit-relax-mode', (event: IpcMainEvent, message: string) => {
  if (event && message && mainWindow) {
    dialog.showMessageBoxSync(mainWindow, {
      title: 'Exiting Relax Mode',
      message,
      type: 'warning',
    });
    event.sender.send('exit-relax-mode-dialog-closed');
  }
});

ipcMain.on('login-success', () => {
  if (mainWindow) {
    mainWindow.maximize();
  }
});

ipcMain.on(
  'sign-url-for-path',
  (event: IpcMainEvent, objName: string, filePath: string) => {
    if (event && objName && filePath) {
      generateV4ReadSignedUrl(filePath)
        // eslint-disable-next-line promise/always-return
        .then((url: string) => {
          event.sender.send('signed-url', objName, url);
        })
        .catch(console.log);
    }
  }
);

ipcMain.on(
  'retrieve-from-local',
  (event: IpcMainEvent, objName: string, filePath: string) => {
    if (event && objName && filePath) {
      const result = require(filePath);
      event.sender.send('retrieved-result', objName, result);
    }
  }
);

ipcMain.on('logout', () => {
  if (mainWindow) {
    mainWindow.unmaximize();
  }
});

// process.env.OPENH264_LIBRARY = path.join(
//   DETECTION_PATH,
//   process.env.OPENH264_LIBRARY as string
// );

const daemon = (script: any, args: any) => {
  // spawn the child using the same node process as ours
  const child = spawn(script, args, {
    detached: true,
    stdio: 'ignore',
  });

  // required so the parent can exit
  child.unref();

  return child;
};

const fourDigits = (num: number | string) =>
  num > 999 ? num : `${`000${num}`.substr(-4)}`;

const CHILD_PROCESS = runChildProcess();

app.on('window-all-closed', () => {
  console.log(`[CHILD_PROCESS]: pid=${CHILD_PROCESS.pid}`);
  console.log(`[CHILD_PROCESS]: spawnfile=${CHILD_PROCESS.spawnfile}`);
  console.log(`[CHILD_PROCESS]: spawnargs=${CHILD_PROCESS.spawnargs}`);
  const CAMERA_SOCKET_RETRYCON = { isCameraStop: false };
  const COMMUNICATION_SOCKET_RETRYCON = { retry: true };
  createClientSocket(
    9090,
    (payload: string) => {
      const data = JSON.parse(payload);
      console.log(`[CAMERA_SOCKET]: data.emotion=${data.emotion}`);
    },
    () => !CAMERA_SOCKET_RETRYCON.isCameraStop
  );
  const COMMUNICATION_SOCKET = createClientSocket(
    COMMUNICATION_PORT,
    (payload: string) => {
      CAMERA_SOCKET_RETRYCON.isCameraStop = true;
      console.log(`[COMMUNICATION_SOCKET]: payload=${payload}`);
      const eventType = payload.substring(0, payload.indexOf(':'));
      const dataStr = payload.substring(payload.indexOf(':') + 1);
      console.log('eventType', eventType);
      console.log('dataStr', dataStr);
      if (eventType === 'SessionResult') {
        const sessionDetectedResult: any = JSON.parse(dataStr);
        if (
          sessionDetectedResult &&
          sessionDetectedResult.periods &&
          sessionDetectedResult.periods.length > 0
        ) {
          const sessionEmotionInfo = sessionDetectedResult.periods.map(
            (ps: any, i: number) => ({
              emotion: i + 1,
              periods: ps.map((p: any) => ({
                duration: p.duration,
                periodStart: p.period_start,
                periodEnd: p.period_end,
              })),
            })
          );
          const endSessionInfo: any = {
            emotions: sessionEmotionInfo,
            info: JSON.stringify(sessionDetectedResult.result),
          };
          if (APP_BACKUP.token && APP_BACKUP.sessionId !== 0) {
            const evidenceFoldername = `session_${fourDigits(
              APP_BACKUP.sessionId
            )}/`;
            const evidenceFolder = path.join(
              __dirname,
              `../evidences/${evidenceFoldername}`
            );
            console.log('[TEST]:---evidenceFolder', evidenceFolder);
            const fetch = require('node-fetch');
            fetch(`${API_ENDPOINT}/sessions/${APP_BACKUP.sessionId}/end`, {
              method: 'put',
              body: JSON.stringify(endSessionInfo),
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${APP_BACKUP.token}`,
              },
            })
              .then((res: any) => res.json())
              .then(() => {
                const childpro = daemon(
                  path.join(DETECTION_PATH, './dist/upload.exe'),
                  [
                    '--fr',
                    evidenceFolder.replace(/\\/g, '/'),
                    '--to',
                    evidenceFoldername,
                  ]
                );
                console.log(childpro);
              })
              .then(() => {
                // Respect the OSX convention of having the application in memory even
                // after all windows have been closed
                if (process.platform !== 'darwin') {
                  app.quit();
                }
              })
              .catch(console.log);
          } else if (process.platform !== 'darwin') {
            app.quit();
          }
        } else if (process.platform !== 'darwin') {
          app.quit();
        }
      } else if (process.platform !== 'darwin') {
        app.quit();
      }
    },
    () => COMMUNICATION_SOCKET_RETRYCON.retry,
    () => {
      console.log(
        `[ELECTRON_MAIN_PROCESS]: Connect success to port ${COMMUNICATION_PORT}`
      );
      COMMUNICATION_SOCKET_RETRYCON.retry = false;
    }
  );
  COMMUNICATION_SOCKET.write('exit');
});

if (process.env.E2E_BUILD === 'true') {
  // eslint-disable-next-line promise/catch-or-return
  app.whenReady().then(createWindows);
} else {
  app.on('ready', createWindows);
}

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createMainWindow();
});
