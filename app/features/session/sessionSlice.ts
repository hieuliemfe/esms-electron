import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../../store';

export type SessionSummaryInfo = {
  angry_duration_warning_max: number;
  angry_warning: number;
  emotion_level: number;
  emotionless_warning: boolean;
  emotions_duration: number[];
  emotions_period_count: number[];
  negative_emotions_duration: number;
  negative_emotions_period_count: number;
  neutral_emotion_period_count: number;
  neutral_emotions_duration: number;
  no_face_detected_duration: number;
  no_face_detected_duration_warning_max: number;
  no_face_detected_period_count: number;
  no_face_detected_warning: number;
  positive_emotions_duration: number;
  positive_emotions_period_count: number;
  total_session_duration: number;
  unidentified_period_duration: number;
};

export type PeriodInfo = {
  emotion: number;
  duration: number;
  period_end: number;
  period_start: number;
};

export type SessionDetectedInfo = {
  result: SessionSummaryInfo;
  periods: PeriodInfo[][];
};

const sessionSlice = createSlice({
  name: 'session',
  initialState: {
    sessionId: 0,
    sessionDetectedResult: {} as SessionDetectedInfo,
    historyId: 0,
  },
  reducers: {
    setSessionId: (state, { payload }) => {
      state.sessionId = payload;
    },
    setSessionDetectedResult: (state, { payload }) => {
      state.sessionDetectedResult = payload;
    },
    setHistoryId: (state, { payload }) => {
      state.historyId = payload;
    },
  },
});

export const {
  setSessionId,
  setSessionDetectedResult,
  setHistoryId,
} = sessionSlice.actions;

export default sessionSlice.reducer;

export const selectSessionId = (state: RootState) => state.session.sessionId;

export const selectSessionDetectedResult = (state: RootState) =>
  state.session.sessionDetectedResult;

export const selectHistoryId = (state: RootState) => state.session.historyId;
