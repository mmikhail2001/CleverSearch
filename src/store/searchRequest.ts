import { createSlice } from "@reduxjs/toolkit";
import { diskTypes, fileTypes } from "../models/searchParams";

const searchSlice = createSlice({
  name: "whatToShow",
  initialState: {
    smartSearch: false,
    fileType: [fileTypes.all],
    query: "",
    dir: "",
    disk: [diskTypes.our],
  },
  reducers: {
    newValues(state, action) {
      state = action.payload;
    },
  },
});

// Extract the action creators object and the reducer
export const { actions, reducer } = searchSlice;
// Extract and export each action creator by name
export const { newValues } = actions;
// Export the reducer, either as a default or named export
