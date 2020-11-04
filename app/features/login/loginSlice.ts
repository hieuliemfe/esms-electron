import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../../store';

const loginSlice = createSlice({
  name: 'login',
  initialState: {
    token: '',
    userProfile: {},
    counterId: 0,
    shiftId: 0,
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
  },
});

export const {
  setToken,
  setUserProfile,
  setCounterId,
  setShiftId,
} = loginSlice.actions;

export default loginSlice.reducer;

export const selectToken = (state: RootState) => state.login.token;

export const selectUserProfile = (state: RootState) => state.login.userProfile;

export const selectCounterId = (state: RootState) => state.login.counterId;

export const selectShiftId = (state: RootState) => state.login.shiftId;
