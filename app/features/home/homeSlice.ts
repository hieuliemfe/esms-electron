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
    isLoggedIn: false,
    isCheckedIn: false,
    eviVideos: {} as EvidenceUrls,
    eviPeriods: {} as EvidencePeriods,
    lastUpdateSession: Date.now(),
    isComSocReady: false,
    evidencePath: '',
  },
  reducers: {
    setEviVideo: (state, { payload }) => {
      state.eviVideos = payload;
    },
    addEviVideo: (state, { payload }) => {
      state.eviVideos = { ...state.eviVideos, ...payload };
    },
    setEviPeriod: (state, { payload }) => {
      state.eviPeriods = payload;
    },
    addEviPeriod: (state, { payload }) => {
      state.eviPeriods = { ...state.eviPeriods, ...payload };
    },
    setLoggedIn: (state, { payload }) => {
      state.isLoggedIn = payload;
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
    setComSocReady: (state, { payload }) => {
      state.isComSocReady = payload;
    },
    setEvidencePath: (state, { payload }) => {
      state.evidencePath = payload;
    },
  },
});

export const {
  setEviVideo,
  addEviVideo,
  setEviPeriod,
  addEviPeriod,
  setShowShiftList,
  setLoggedIn,
  setCheckedIn,
  setLastUpdateSession,
  setComSocReady,
  setEvidencePath,
} = homeSlice.actions;

export default homeSlice.reducer;

export const selectEviVideos = (state: RootState) => state.home.eviVideos;

export const selectEviPeriods = (state: RootState) => state.home.eviPeriods;

export const selectIsShowShiftList = (state: RootState) =>
  state.home.isShowShiftList;

export const selectIsLoggedIn = (state: RootState) => state.home.isLoggedIn;

export const selectIsCheckedIn = (state: RootState) => state.home.isCheckedIn;

export const selectLastUpdateSession = (state: RootState) =>
  state.home.lastUpdateSession;

export const selectIsComSocReady = (state: RootState) =>
  state.home.isComSocReady;

export const selectEvidencePath = (state: RootState) => state.home.evidencePath;
