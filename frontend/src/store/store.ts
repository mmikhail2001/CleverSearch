import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useSelector } from 'react-redux';
import { filesApi } from '@api/filesApi';
import { userApi } from '@api/userApi';
import { searchAPi } from '@api/searchApi';
import { reducer as reducerSearch } from './searchRequest';
import { reducer as reducerPath } from './currentDirectoryAndDisk';
import { reducer as reducerUser } from './userAuth';
import reducer from './whatToShow';


export const store = configureStore({
	reducer: {
		[userApi.reducerPath]: userApi.reducer,
		[filesApi.reducerPath]: filesApi.reducer,
		[searchAPi.reducerPath]: searchAPi.reducer,
		whatToShow: reducer,
		currentDirDisk: reducerPath,
		searchRequest: reducerSearch,
		userAuth: reducerUser
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware()
			.concat(filesApi.middleware)
			.concat(userApi.middleware)
			.concat(searchAPi.middleware)
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
