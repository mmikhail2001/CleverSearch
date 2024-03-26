import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ActionPayload {
	isAuthenticated: null | boolean,
}



const searchSlice = createSlice({
	name: 'whatToShow',
	initialState: {
		isAuthenticated: null as null | boolean,
	} as ActionPayload,
	reducers: {
		login() {
			return {
				isAuthenticated: true,
			};
		},
		logout() {
			return {
				isAuthenticated: false,
			};
		},
	},
});

export const { actions, reducer } = searchSlice;
export const { login, logout } = actions;
