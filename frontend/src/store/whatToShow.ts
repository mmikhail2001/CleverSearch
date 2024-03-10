import { PayloadAction, createSlice } from "@reduxjs/toolkit";

const showSlice = createSlice({
  name: "whatToShow",
  initialState: {
    isSearch: false,
    isShow: true,
  },
  reducers: {
    switchToSearch(state, action: PayloadAction<null>) {
      state.isSearch = true;
      state.isShow = false;
    },
    switchToShow(state, action: PayloadAction<null>) {
      state.isShow = true;
      state.isSearch = false;
    },
  },
});

// Extract the action creators object and the reducer
const { actions, reducer } = showSlice;
// Extract and export each action creator by name
export const { switchToSearch, switchToShow } = actions;
// Export the reducer, either as a default or named export
export default reducer;
