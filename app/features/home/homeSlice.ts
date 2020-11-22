import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../../store';

type AngryPeriod = {
  no: number;
  duration: number;
  emotion: number;
  period_start: number;
  period_end: number;
};

export type EvidenceUrls = {
  [filename: string]: string;
};

export type EvidencePeriods = {
  [filename: string]: AngryPeriod[];
};

const homeSlice = createSlice({
  name: 'home',
  initialState: {
    isShowShiftList: true,
    isCheckedIn: false,
    eviVideos: {} as EvidenceUrls,
    eviPeriods: {} as EvidencePeriods,
    lastUpdateSession: Date.now(),
  },
  reducers: {
    addEviVideo: (state, { payload }) => {
      state.eviVideos = { ...state.eviVideos, ...payload };
    },
    addEviPeriod: (state, { payload }) => {
      state.eviPeriods = { ...state.eviPeriods, ...payload };
    },
    setCheckedIn: (state, { payload }) => {
      state.isCheckedIn = payload;
    },
    setShowShiftList: (state, { payload }) => {
      state.isShowShiftList = payload;
    },
    setLastUpdateSession: (state, { payload }) => {
      state.lastUpdateSession = payload;
    },
  },
});

export const {
  addEviVideo,
  addEviPeriod,
  setShowShiftList,
  setCheckedIn,
  setLastUpdateSession,
} = homeSlice.actions;

export default homeSlice.reducer;

export const selectEviVideos = (state: RootState) => state.home.eviVideos;

export const selectEviPeriods = (state: RootState) => state.home.eviPeriods;

export const selectIsShowShiftList = (state: RootState) =>
  state.home.isShowShiftList;

export const selectIsCheckedIn = (state: RootState) => state.home.isCheckedIn;

export const selectLastUpdateSession = (state: RootState) =>
  state.home.lastUpdateSession;
