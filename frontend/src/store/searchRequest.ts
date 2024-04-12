import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { SearchParams, fileTypes } from '@models/searchParams';
import { diskTypes } from '@models/disk';
import { compareArrays, isDiskEqual } from '@helpers/hooks/useShowParams';

const searchSlice = createSlice({
	name: 'searchReq',
	initialState: {
		smartSearch: false,
		fileType: ['all' as fileTypes],
		query: '',
		dir: [] as string[],
		disk: ['all'] as diskTypes[],
	} as SearchParams,
	reducers: {
		newValues(state, action: PayloadAction<SearchParams>) {
			if (compareArrays(state.dir, action.payload.dir)
				&& isDiskEqual(state.disk[0], action.payload.disk[0])
				&& compareArrays(state.fileType, action.payload.fileType)
				&& state.smartSearch === action.payload.smartSearch
				&& state.query === action.payload.query
			)
				return state

			return {
				...state,
				...action.payload
			};
		},
	},
});

export const { actions, reducer } = searchSlice;
export const { newValues } = actions;
