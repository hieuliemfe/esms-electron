import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../../store';

const cameraSlice = createSlice({
  name: 'camera',
  initialState: {
    communicationSocket: {},
  },
  reducers: {
    updateCommunicationSocket: (state, { payload }) => {
      state.communicationSocket = payload;
    },
  },
});

export const { updateCommunicationSocket } = cameraSlice.actions;

export default cameraSlice.reducer;

export const selectCommunicationSocket = (state: RootState) =>
  state.camera.communicationSocket;
