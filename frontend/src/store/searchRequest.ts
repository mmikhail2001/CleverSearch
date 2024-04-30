import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { SearchParams, fileTypes } from '@models/searchParams';
import { diskTypes } from '@models/disk';

const searchSlice = createSlice({
	name: 'searchReq',
	initialState: {
		smartSearch: false,
		fileType: ['all' as fileTypes],
		query: '',
		dir: [] as string[],
		disk: ['internal'] as diskTypes[],
	} as SearchParams,
	reducers: {
		newSearchValues(state, action: PayloadAction<SearchParams>) {
			return {
				...state,
				...action.payload
			};
		},
	},
});

export const { actions, reducer } = searchSlice;
export const { newSearchValues } = actions;
