import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const shareAccessSlice = createSlice({
	name: 'shareAccessSlice',
	initialState: {
		access: '',
	},
	reducers: {
		changeAccess(state, action: PayloadAction<string>) {
			return {
				access: action.payload,
			};
		},
	},
});

export const { actions, reducer } = shareAccessSlice;
export const { changeAccess} = actions;
