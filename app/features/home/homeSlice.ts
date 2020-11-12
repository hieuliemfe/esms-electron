import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../../store';

export type EvidenceUrl = {
  [filename: string]: string;
};

const homeSlice = createSlice({
  name: 'home',
  initialState: {
    isShowShiftList: true,
    isCheckedIn: false,
    eviUrls: {} as EvidenceUrl,
  },
  reducers: {
    addEviUrl: (state, { payload }) => {
      state.eviUrls = { ...state.eviUrls, ...payload };
    },
    setCheckedIn: (state, { payload }) => {
      state.isCheckedIn = payload;
    },
    setShowShiftList: (state, { payload }) => {
      state.isShowShiftList = payload;
    },
  },
});

export const { addEviUrl, setShowShiftList, setCheckedIn } = homeSlice.actions;

export default homeSlice.reducer;

export const selectEviUrls = (state: RootState) => state.home.eviUrls;

export const selectIsShowShiftList = (state: RootState) =>
  state.home.isShowShiftList;

export const selectIsCheckedIn = (state: RootState) => state.home.isCheckedIn;
