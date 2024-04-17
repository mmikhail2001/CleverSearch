import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ActionPayload {
	isAuthenticated: null | boolean,
	email?: string,
}

export interface ActionUserEmail {
	email: string,
}


const searchSlice = createSlice({
	name: 'whatToShow',
	initialState: {
		isAuthenticated: null as null | boolean,
		email: '',
	} as ActionPayload,
	reducers: {
		login(state) {
			return {
				...state,
				isAuthenticated: true,

			};
		},
		logout(state) {
			return {
				...state,
				email: '',
				isAuthenticated: false,
			};
		},
		setUserEmail(state, action: PayloadAction<ActionUserEmail>) {
			return { ...state, email: action.payload.email }
		}
	},
});

export const { actions, reducer } = searchSlice;
export const { login, logout, setUserEmail } = actions;
