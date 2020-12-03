import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';
// eslint-disable-next-line import/no-cycle
import loadingBarReducer from './components/loading-bar/loadingBarSlice';
// eslint-disable-next-line import/no-cycle
import loginReducer from './features/login/loginSlice';
// eslint-disable-next-line import/no-cycle
import homeReducer from './features/home/homeSlice';
// eslint-disable-next-line import/no-cycle
import sessionReducer from './features/session/sessionSlice';

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    loadingBar: loadingBarReducer,
    login: loginReducer,
    home: homeReducer,
    session: sessionReducer,
  });
}
