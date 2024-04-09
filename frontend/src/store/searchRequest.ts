import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { SearchParams, fileTypes } from '@models/searchParams';
import { diskTypes } from '@models/disk';

const searchSlice = createSlice({
	name: 'whatToShow',
	initialState: {
		smartSearch: false,
		fileType: ['all' as fileTypes],
		query: '',
		dir: [] as string[],
		disk: ['own'] as diskTypes[],
	} as SearchParams,
	reducers: {
		newValues(state, action: PayloadAction<SearchParams>) {
			return {
				...state,
				...action.payload
			};
		},
	},
});

export const { actions, reducer } = searchSlice;
export const { newValues } = actions;
