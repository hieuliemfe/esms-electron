import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../../store';

export type EvidenceUrl = {
  [filename: string]: string;
};

const homeSlice = createSlice({
  name: 'home',
  initialState: {
    eviUrls: [] as EvidenceUrl[],
  },
  reducers: {
    addEviUrl: (state, { payload }) => {
      state.eviUrls.push(payload);
    },
  },
});

export const { addEviUrl } = homeSlice.actions;

export default homeSlice.reducer;

export const selectEviUrls = (state: RootState) => state.home.eviUrls;
