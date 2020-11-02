import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';
// eslint-disable-next-line import/no-cycle
import loginReducer from './features/login/loginSlice';
// eslint-disable-next-line import/no-cycle
import cameraReducer from './features/camera/cameraSlice';

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    login: loginReducer,
    camera: cameraReducer,
  });
}
