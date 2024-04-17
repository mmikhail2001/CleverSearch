import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useSelector } from 'react-redux';

import { filesApi } from '@api/filesApi';
import { userApi } from '@api/userApi';
import { searchAPi } from '@api/searchApi';
import { diskApi } from '@api/diskApi';

import { reducer as reducerSearch } from './searchRequest';
import { reducer as reducerShow } from './showRequest';
import { reducer as reducerUser } from './userAuth';
import reducer from './whatToShow';
import { reducer as reducerDisks } from './userDisks'
import {reducer as reducerFileWS} from './fileProcess' 

export const store = configureStore({
	reducer: {
		[userApi.reducerPath]: userApi.reducer,
		[filesApi.reducerPath]: filesApi.reducer,
		[searchAPi.reducerPath]: searchAPi.reducer,
		[diskApi.reducerPath]: diskApi.reducer,
		fileProcess: reducerFileWS,
		whatToShow: reducer,
		searchRequest: reducerSearch,
		showRequest: reducerShow,
		userAuth: reducerUser,
		disks: reducerDisks,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware()
			.concat(filesApi.middleware)
			.concat(userApi.middleware)
			.concat(searchAPi.middleware)
			.concat(diskApi.middleware)
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;