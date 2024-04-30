import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const searchFilter = createSlice({
	name: 'searchFilter',
	initialState: {
		isOpen: false,
	},
	reducers: {
		changeOpenFilter(state, payload: PayloadAction<boolean>) {
            return {
                isOpen: payload.payload,
            }
		},
	},
});

// Extract the action creators object and the reducer
const { actions, reducer } = searchFilter
;
// Extract and export each action creator by name
export const { changeOpenFilter } = actions;
// Export the reducer, either as a default or named export
export {reducer};
