import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../../store';

const cameraSlice = createSlice({
  name: 'camera',
  initialState: {
    frame64: '',
  },
  reducers: {
    updateFrame: (state, { payload }) => {
      state.frame64 = payload;
    },
  },
});

export const { updateFrame } = cameraSlice.actions;

export default cameraSlice.reducer;

export const selectFrame = (state: RootState) => state.camera.frame64;
