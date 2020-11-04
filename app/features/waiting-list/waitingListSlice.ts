import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
// import { RootState } from '../../store';

const waitingListSlice = createSlice({
  name: 'waitingList',
  initialState: {},
  reducers: {},
});

// export const {} = waitingListSlice.actions;

export default waitingListSlice.reducer;

// export const selectShiftList = (state: RootState) => state.waitingList.shiftList;
