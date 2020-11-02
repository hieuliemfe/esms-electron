import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../../store';

const loginSlice = createSlice({
  name: 'login',
  initialState: { token: '', userInfo: {} },
  reducers: {
    setToken: (state, { payload }) => {
      state.token = payload;
    },
    setUserInfo: (state, { payload }) => {
      state.userInfo = payload;
    },
  },
});

export const { setToken, setUserInfo } = loginSlice.actions;

export default loginSlice.reducer;

export const selectToken = (state: RootState) => state.login.token;

export const selectUserInfo = (state: RootState) => state.login.userInfo;
