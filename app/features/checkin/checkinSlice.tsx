import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
// import { RootState } from '../../store';

const checkinSlice = createSlice({
  name: 'checkin',
  initialState: {},
  reducers: {},
});

// export const {} = checkinSlice.actions;

export default checkinSlice.reducer;

// export const selectShiftList = (state: RootState) => state.checkin.shiftList;
