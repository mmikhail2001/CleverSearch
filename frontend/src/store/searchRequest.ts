import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { SearchParams, diskTypes, fileTypes } from '@models/searchParams';

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
