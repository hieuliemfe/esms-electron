import path from 'path';
import { spawn, ChildProcess } from 'child_process';
import net from 'net';

export const PYTHON_VENV_PATH = path.join(
  __dirname,
  '../venv/1/Scripts/python.exe'
);

export const DETECTION_PATH = path.join(__dirname, '../detection/');

type CommunicationSocket = {
  SOCKET: net.Socket | null;
};

export const COMMUNICATION_SOCKET: CommunicationSocket = {
  SOCKET: null,
};

export const COMMUNICATION_PORT = 12345;

const COMSOC_HANDLER: CallableFunction[] = [];

export const setComSocHandler = (handler: CallableFunction) => {
  COMSOC_HANDLER.pop();
  COMSOC_HANDLER.push(handler);
};

export const handleComSocData = (data: string) => {
  const handler = COMSOC_HANDLER.pop();
  if (handler) {
    handler(data);
  }
};

export const createClientSocket = (
  port: number,
  dataHandler: CallableFunction = handleComSocData,
  shoudReconnection: CallableFunction = () => true,
  connectCallback: () => void = () => {
    console.log('Connect to Python success');
  }
) => {
  const comSoc = new net.Socket();
  comSoc.connect(port, 'localhost', connectCallback);
  comSoc.on('data', (data: Buffer) => {
    dataHandler(data.toString());
  });
  comSoc.on('error', (err: Error) => {
    console.log('Error:', err);
  });
  comSoc.on('close', () => {
    if (shoudReconnection()) {
      comSoc.connect(port, 'localhost');
    }
  });
  return comSoc;
};

export default function runChildProcess(): ChildProcess {
  const spawnChildProccess = (command: string, args?: readonly string[]) => {
    const childPro = spawn(command, args || [], {
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    }).on('error', (err: Error) => {
      console.error('Child process spawning error:', err);
    });
    childPro.unref();
    return childPro;
  };

  const childProcess = spawnChildProccess(
    path.join(DETECTION_PATH, './dist/main.exe')
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  childProcess.stdout.on('data', (chunk: any) => {
    console.log('[stdout]:--', (chunk as Buffer).toString());
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  childProcess.stderr.on('data', (chunk: any) => {
    console.log('[stderr]:--', (chunk as Buffer).toString());
  });

  // COMMUNICATION_SOCKET.SOCKET = createClientSocket(
  //   COMMUNICATION_PORT,
  //   handleComSocData,
  //   () => !childProcess.killed
  // );

  return childProcess;
}
