import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { ShowParams, fileTypes } from '@models/searchParams';
import { diskTypes } from '@models/disk';
import { ConnectedClouds } from '@models/user';

const showSlice = createSlice({
	name: 'searchReq',
	initialState: {
        fileType: ['all' as fileTypes],
        dir: [] as string[],
        disk: 'all' as diskTypes,
	} as ShowParams,
	reducers: {
		newValues(state, action: PayloadAction<ShowParams>) {
			const dirToSet = action.payload.dir?.filter(val => val !== '')

			return {
				...state,
				...action.payload,
				dir: dirToSet,
			};
		},
		changeDir(state, action: PayloadAction<string[]>) {
			const dirToSet = action.payload?.filter(val => val !== '')
			return {
				...state,
				dir: dirToSet
			}
		},
		changeDisk(state, action: PayloadAction<diskTypes | ConnectedClouds>) {
			return {
				...state,
				disk: action.payload
			}
		},
	},
});

export const { actions, reducer } = showSlice;
export const { newValues,changeDisk, changeDir } = actions;
