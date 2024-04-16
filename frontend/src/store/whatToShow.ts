import { createSlice } from '@reduxjs/toolkit';

const showSlice = createSlice({
	name: 'whatToShow',
	initialState: {
		isSearch: false,
		isShow: false,
		isProccessed: false,
		isShared: false,
		isLoved: false,
	},
	reducers: {
		switchToSearch(state) {
			state.isSearch = true;
			state.isShow = false;
			state.isProccessed = false;
			state.isShared = false;
			state.isLoved = false;
		},
		switchToShow(state) {
			state.isShow = true;
			state.isSearch = false;
			state.isProccessed = false;
			state.isShared = false;
			state.isLoved = false;
		},
		switchToProcessed(state) {
			state.isShow = false;
			state.isSearch = false;
			state.isProccessed = true;
			state.isShared = false;
			state.isLoved = false;
		},
		switchToShared(state) {
			state.isShow = false;
			state.isSearch = false;
			state.isProccessed = false;
			state.isShared = true;
			state.isLoved = false;
		},
		switchToLoved(state) {
			state.isShow = false;
			state.isSearch = false;
			state.isProccessed = false;
			state.isShared = false;
			state.isLoved = true;
		},
	},
});

// Extract the action creators object and the reducer
const { actions, reducer } = showSlice;
// Extract and export each action creator by name
export const { switchToSearch, switchToShow, switchToProcessed, switchToShared } = actions;
// Export the reducer, either as a default or named export
export default reducer;
