import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { fileFile } from '@models/searchParams';

const fileWsSlice = createSlice({
	name: 'searchReq',
	initialState: {
		fileOnProcess: [] as fileFile[],
		fileToNotify: [] as fileFile[],
	},
	reducers: {
		addNewFiles(state, action: PayloadAction<fileFile[]>) {
			return {
				fileOnProcess: [
					...state.fileOnProcess,
					...action.payload,
				],
				fileToNotify: [
					...state.fileToNotify,
					...action.payload,
				]
			};
		},
        removeFiles(state, action: PayloadAction<fileFile[]>) {
            const filteredFiles = state.fileOnProcess.filter((oldFile) => {
				return !action.payload.find(file => file.id === oldFile.id)
			})
			return {
				fileOnProcess:[...filteredFiles],
				fileToNotify: state.fileToNotify, 
			};
		},
		removeNotify(state, action: PayloadAction<fileFile[]>) {
            const filteredFiles = state.fileToNotify.filter((oldFile) => {
				return !action.payload.find(file => file.id === oldFile.id)
			})
			return {
				fileOnProcess: state.fileOnProcess ,
				fileToNotify: filteredFiles, 
			};
		},
	},
});

export const { actions, reducer } = fileWsSlice;
export const { removeFiles,addNewFiles,removeNotify} = actions;
