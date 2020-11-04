import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../../store';

const sessionSlice = createSlice({
  name: 'session',
  initialState: {
    sessionId: 0,
  },
  reducers: {
    setSessionId: (state, { payload }) => {
      state.sessionId = payload;
    },
  },
});

export const { setSessionId } = sessionSlice.actions;

export default sessionSlice.reducer;

export const selectSessionId = (state: RootState) => state.session.sessionId;
