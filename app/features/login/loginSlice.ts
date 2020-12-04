import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../../store';
import { ProfileInfo } from '../../services/root';

export type Suspension = {
  id: number;
  expiredOn: string;
  reason: string | null;
};

const loginSlice = createSlice({
  name: 'login',
  initialState: {
    token: '',
    userProfile: {} as ProfileInfo,
    counterId: 0,
    shiftId: 0,
    relaxMode: false,
    suspension: {} as Suspension,
    lastAccessLogin: Date.now(),
  },
  reducers: {
    setToken: (state, { payload }) => {
      state.token = payload;
    },
    setUserProfile: (state, { payload }) => {
      state.userProfile = payload;
    },
    setCounterId: (state, { payload }) => {
      state.counterId = payload;
    },
    setShiftId: (state, { payload }) => {
      state.shiftId = payload;
    },
    setRelaxMode: (state, { payload }) => {
      state.relaxMode = payload;
    },
    setSuspension: (state, { payload }) => {
      state.suspension = payload;
    },
    setLastAccessLogin: (state, { payload }) => {
      state.lastAccessLogin = payload;
    },
  },
});

export const {
  setToken,
  setUserProfile,
  setCounterId,
  setShiftId,
  setRelaxMode,
  setSuspension,
  setLastAccessLogin,
} = loginSlice.actions;

export default loginSlice.reducer;

export const selectToken = (state: RootState) => state.login.token;

export const selectUserProfile = (state: RootState) => state.login.userProfile;

export const selectCounterId = (state: RootState) => state.login.counterId;

export const selectShiftId = (state: RootState) => state.login.shiftId;

export const selectRelaxMode = (state: RootState) => state.login.relaxMode;

export const selectSuspension = (state: RootState) => state.login.suspension;

export const selectLastAccessLogin = (state: RootState) =>
  state.login.lastAccessLogin;
