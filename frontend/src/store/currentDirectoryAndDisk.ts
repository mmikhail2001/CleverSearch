import { diskTypes } from '@models/searchParams';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { changeDirAction } from '@models/actions';

const currentPath = createSlice({
	name: 'currentPath',
	initialState: {
		/** path that we in like ["global", "file"...] */
		dirs: [] as string[],
		/** Current directory, that we on now like
     * dirs = ["global", "file"] => currentDir = "file"*/
		currentDir: '',
		/** Select current disk that we show */
		currentDisk: 'all' as diskTypes,
	},
	reducers: {
		/** Change directory and dirs to other */
		changeDir(state, action: PayloadAction<changeDirAction>) {
			state.currentDir = action.payload.current;
			state.dirs = action.payload.dirs;
		},
		changeDisk(state, action: PayloadAction<diskTypes>) {
			state.currentDisk = action.payload;
		},
	},
});

export const { actions, reducer } = currentPath;
export const { changeDir, changeDisk } = actions;
