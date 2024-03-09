import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useSelector } from "react-redux";
import { filesApi } from "@api/filesApi";
import { userApi } from "@api/userApi";
import { searchAPi } from "@api/searchApi";
import { reducer as reducerSearch } from "./searchRequest";
import reducer from "./whatToShow";

export const store = configureStore({
  reducer: {
    [userApi.reducerPath]: userApi.reducer,
    [filesApi.reducerPath]: filesApi.reducer,
    [searchAPi.reducerPath]: searchAPi.reducer,
    whatToShow: reducer,
    searchRequest: reducerSearch,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(filesApi.middleware)
      .concat(userApi.middleware)
      .concat(searchAPi.middleware),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
