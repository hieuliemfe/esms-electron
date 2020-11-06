import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../../store';

const angryWarningModalSlice = createSlice({
  name: 'angryWarningModal',
  initialState: {
    show: false,
  },
  reducers: {
    setShow: (state, { payload }) => {
      state.show = payload;
    },
  },
});

export const { setShow } = angryWarningModalSlice.actions;

export default angryWarningModalSlice.reducer;

export const selectShow = (state: RootState) => state.angryWarningModal.show;
