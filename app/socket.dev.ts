import path from 'path';
import { spawn } from 'child_process';
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

export const createClientSocket = (
  port: number,
  dataHandler: CallableFunction,
  shoudReconnection: CallableFunction
) => {
  const comSoc = new net.Socket();
  comSoc.connect(port, 'localhost', () => {
    console.log('Connect to Python success');
  });
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

const COMSOC_HANDLER: CallableFunction[] = [];

export const setComSocHandler = (handler: CallableFunction) => {
  COMSOC_HANDLER.pop();
  COMSOC_HANDLER.push(handler);
};

const handleComSocData = (data: string) => {
  const handler = COMSOC_HANDLER.pop();
  if (handler) {
    handler(data);
  }
};

export default function runChildProcess() {
  const spawnChildProccess = (command: string, options: readonly string[]) => {
    const childPro = spawn(command, options).on('error', (err: Error) => {
      console.error('Child process spawning error:', err);
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      childProcess = spawnChildProccess(command, options);
    });
    return childPro;
  };

  let childProcess = spawnChildProccess(PYTHON_VENV_PATH, [
    path.join(DETECTION_PATH, 'main.py'),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  childProcess.stdout.on('data', (chunk: any) => {
    console.log('[stdout]:--', (chunk as Buffer).toString());
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  childProcess.stderr.on('data', (chunk: any) => {
    console.log('[stderr]:--', (chunk as Buffer).toString());
  });

  COMMUNICATION_SOCKET.SOCKET = createClientSocket(
    COMMUNICATION_PORT,
    handleComSocData,
    () => !childProcess.killed
  );
}
