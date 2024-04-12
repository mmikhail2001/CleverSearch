import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { ShowParams, fileTypes } from '@models/searchParams';
import { diskTypes } from '@models/disk';
import { compareArrays, isDiskEqual } from '@helpers/hooks/useShowParams';
import { ConnectedClouds } from '@models/user';

const showSlice = createSlice({
	name: 'searchReq',
	initialState: {
		limit: 10,
        offset: 0,
        fileType: ['all' as fileTypes],
        dir: [] as string[],
        disk: 'all' as diskTypes,
        sharedReq: true,
        dirsReq: true,
        filesReq: true,
        nestingReq: true,
        personalReq: true,
        externalDiskRequired: true,
        internalDiskRequired: true,
	} as ShowParams,
	reducers: {
		newValues(state, action: PayloadAction<ShowParams>) {
			// if (compareArrays(state.dir, action.payload.dir)
			// 	&& state.disk 
			// 	&& action.payload.disk 
			// 	&& isDiskEqual(state.disk, action.payload.disk)
			// 	&& compareArrays(state.fileType, action.payload.fileType)
			// )
				// return state
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
