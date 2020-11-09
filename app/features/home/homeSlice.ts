import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
// import { RootState } from '../../store';

const homeSlice = createSlice({
  name: 'home',
  initialState: {},
  reducers: {},
});

// export const {} = homeSlice.actions;

export default homeSlice.reducer;

// export const selectShiftList = (state: RootState) => state.home.shiftList;
