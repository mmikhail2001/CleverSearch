import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { UserData } from "@models/userModels";

export const userApi = createApi({
  reducerPath: "userApi",

  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8080/api/users",
  }),

  endpoints: (builder) => ({
    logout: builder.mutation({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
    }),

    login: builder.mutation({
      query: (body: UserData) => ({
        url: "/login",
        method: "POST",
        body: body,
      }),
    }),

    register: builder.mutation({
      query: (body: UserData) => ({
        url: "/register",
        method: "POST",
        body: body,
      }),
    }),

    profile: builder.query({ query: () => "/profile" }),
  }),
});

export const {
  useProfileQuery,
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
} = userApi;
