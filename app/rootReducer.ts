import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';
// eslint-disable-next-line import/no-cycle
import angryWarningModalReducer from './components/modals/angryWarningModalSlice';
// eslint-disable-next-line import/no-cycle
import loadingBarReducer from './components/loading-bar/loadingBarSlice';
// eslint-disable-next-line import/no-cycle
import loginReducer from './features/login/loginSlice';
// eslint-disable-next-line import/no-cycle
import homeReducer from './features/home/homeSlice';
// eslint-disable-next-line import/no-cycle
import checkinReducer from './features/checkin/checkinSlice';
// eslint-disable-next-line import/no-cycle
import waitingListReducer from './features/waiting-list/waitingListSlice';
// eslint-disable-next-line import/no-cycle
import sessionReducer from './features/session/sessionSlice';
// eslint-disable-next-line import/no-cycle
import cameraReducer from './features/camera/cameraSlice';

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    angryWarningModal: angryWarningModalReducer,
    loadingBar: loadingBarReducer,
    login: loginReducer,
    home: homeReducer,
    checkin: checkinReducer,
    waitingList: waitingListReducer,
    session: sessionReducer,
    camera: cameraReducer,
  });
}
