/* eslint-disable import/no-dynamic-require */
/* eslint global-require: off, no-console: off */

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
import { generateV4ReadSignedUrl } from './services/google-cloud';
import runChildProcess, { DETECTION_PATH } from './socket.dev';
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

const RESOURCES_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'resources')
  : path.join(__dirname, '../resources');

const getAssetPath = (...paths: string[]): string => {
  return path.join(RESOURCES_PATH, ...paths);
};

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
    icon: getAssetPath('esms_logo200.png'),
    webPreferences:
      (process.env.NODE_ENV === 'development' ||
        process.env.E2E_BUILD === 'true') &&
      process.env.ERB_SECURE !== 'true'
        ? {
            nodeIntegration: true,
          }
        : {
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

process.env.OPENH264_LIBRARY = path.join(
  DETECTION_PATH,
  process.env.OPENH264_LIBRARY as string
);

const CHILD_PROCESS = runChildProcess();

app.on('window-all-closed', () => {
  console.log('[CHILD_PROCESS]: pid=', CHILD_PROCESS.pid);
  console.log('[CHILD_PROCESS]: spawnfile=', CHILD_PROCESS.spawnfile);
  console.log('[CHILD_PROCESS]: spawnargs=', CHILD_PROCESS.spawnargs);
  console.log('[CHILD_PROCESS]: killed=', CHILD_PROCESS.killed);
  CHILD_PROCESS.kill('SIGTERM');
  console.log('[CHILD_PROCESS]: killed with SIGTERM');
  console.log('[CHILD_PROCESS]: killed=', CHILD_PROCESS.killed);
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
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
