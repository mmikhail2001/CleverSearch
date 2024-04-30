import { diskTypes } from '@models/disk';
import { ConnectedClouds } from '@models/user';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const showSlice = createSlice({
	name: 'whatToShow',
	initialState: {
		isSearch: false,
		isShow: false,
		isProccessed: false,
		isShared: false,
		isLoved: false,
		isDrive: false,
		whatDiskToShow: '' as diskTypes | ConnectedClouds,
	},
	reducers: {
		switchToSearch(state) {
			state.isSearch = true;
			state.isShow = false;
			state.isProccessed = false;
			state.isShared = false;
			state.isLoved = false;
			state.isDrive = false
		},
		switchToShow(state) {
			state.isShow = true;
			state.isSearch = false;
			state.isProccessed = false;
			state.isShared = false;
			state.isLoved = false;
			state.isDrive = false
		},
		switchToProcessed(state) {
			state.isShow = false;
			state.isSearch = false;
			state.isProccessed = true;
			state.isShared = false;
			state.isLoved = false;
			state.isDrive = false
		},
		switchToShared(state) {
			state.isShow = false;
			state.isSearch = false;
			state.isProccessed = false;
			state.isShared = true;
			state.isLoved = false;
			state.isDrive = false
		},
		switchToLoved(state) {
			state.isShow = false;
			state.isSearch = false;
			state.isProccessed = false;
			state.isShared = false;
			state.isLoved = true;
			state.isDrive = false
		},
		switchToDrive(state) {
			state.isShow = false;
			state.isSearch = false;
			state.isProccessed = false;
			state.isShared = false;
			state.isLoved = false;
			state.isDrive = true
		},
		switchDisk(state, action: PayloadAction<diskTypes | ConnectedClouds>) {
			return {
				...state,
				whatDiskToShow: action.payload
			}
		}
	},
});

// Extract the action creators object and the reducer
const { actions, reducer } = showSlice;
// Extract and export each action creator by name
export const { 
	switchToSearch,
	switchToShow,
	switchToProcessed,
	switchToShared,
	switchToLoved ,
	switchDisk,
	switchToDrive,
	} = actions;
// Export the reducer, either as a default or named export
export default reducer;
