import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../../store';
import { ProfileInfo } from '../../services/root';

const loginSlice = createSlice({
  name: 'login',
  initialState: {
    token: '',
    userProfile: {} as ProfileInfo,
    counterId: 0,
    shiftId: 0,
    relaxMode: false,
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
  },
});

export const {
  setToken,
  setUserProfile,
  setCounterId,
  setShiftId,
  setRelaxMode,
} = loginSlice.actions;

export default loginSlice.reducer;

export const selectToken = (state: RootState) => state.login.token;

export const selectUserProfile = (state: RootState) => state.login.userProfile;

export const selectCounterId = (state: RootState) => state.login.counterId;

export const selectShiftId = (state: RootState) => state.login.shiftId;

export const selectRelaxMode = (state: RootState) => state.login.relaxMode;
