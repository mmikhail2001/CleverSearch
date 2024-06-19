import { createSlice } from '@reduxjs/toolkit';

const canAddSlice = createSlice({
	name: 'searchReq',
	initialState: {
		isCanBeAdd: false,
	},
	reducers: {
		giveAddPermission(state) {
			return {
                isCanBeAdd: true,
			};
		},
        removeAddPermission(state) {
            return {
                isCanBeAdd: false,
			}; 
        }
	},
});

export const { actions, reducer } = canAddSlice;
export const { giveAddPermission, removeAddPermission} = actions;
