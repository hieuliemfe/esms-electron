import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../../store';

const angryWarningModalSlice = createSlice({
  name: 'angryWarningModal',
  initialState: {
    show: false,
  },
  reducers: {
    setAngryWarningShow: (state, { payload }) => {
      state.show = payload;
    },
  },
});

export const { setAngryWarningShow } = angryWarningModalSlice.actions;

export default angryWarningModalSlice.reducer;

export const selectAngryWarningShow = (state: RootState) =>
  state.angryWarningModal.show;
