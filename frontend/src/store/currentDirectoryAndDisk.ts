import { diskTypes } from '@models/disk';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { changeDirAction } from '@models/actions';
import { ConnectedClouds } from '@models/user';

const currentPath = createSlice({
	name: 'currentPath',
	initialState: {
		/** path that we in like ["global", "file"...] */
		dirs: [] as string[],
		/** Current directory, that we on now like
	 * dirs = ["global", "file"] => currentDir = "file"*/
		/** Select current disk that we show */
		currentDisk: 'all' as diskTypes | ConnectedClouds,
	},
	reducers: {
		/** Change directory and dirs to other */
		changeDir(state, action: PayloadAction<changeDirAction>) {
			state.dirs = action.payload.dirs.filter(val => val !== '')
		},
		changeDisk(state, action: PayloadAction<diskTypes | ConnectedClouds>) {
			state.currentDisk = action.payload;
		},
	},
});

export const { actions, reducer } = currentPath;
export const { changeDir, changeDisk } = actions;
