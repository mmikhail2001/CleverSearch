import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { SearchParams, diskTypes, fileTypes } from "@models/searchParams";

const searchSlice = createSlice({
  name: "whatToShow",
  initialState: {
    smartSearch: false,
    fileType: [fileTypes.all],
    query: "",
    dir: "",
    disk: ["own"] as diskTypes[],
  } as SearchParams,
  reducers: {
    newValues(state, action: PayloadAction<SearchParams>) {
      state = action.payload;
    },
  },
});

export const { actions, reducer } = searchSlice;
export const { newValues } = actions;
