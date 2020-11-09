import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../../store';

const loadingBarSlice = createSlice({
  name: 'loadingBar',
  initialState: {
    loading: false,
  },
  reducers: {
    setLoading: (state, { payload }) => {
      state.loading = payload;
    },
  },
});

export const { setLoading } = loadingBarSlice.actions;

export default loadingBarSlice.reducer;

export const selectLoading = (state: RootState) => state.loadingBar.loading;
