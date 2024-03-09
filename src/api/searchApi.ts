import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  SearchParams,
  SearchResponse,
  ShowParams,
  ShowResponse,
} from "../models/searchParams";

export const searchAPi = createApi({
  reducerPath: "searchAPi",

  baseQuery: fetchBaseQuery({
    baseUrl: "https://localhost:3000",
  }),

  endpoints: (builder) => ({
    search: builder.mutation<SearchResponse, SearchParams>({
      query: (searchReq: SearchParams) => ({
        url: `/search?smart_search=${searchReq.smartSearch}
        &query=${searchReq.query}
        ${searchReq.disk ? `&disk=${searchReq.disk}` : ""}
        ${searchReq.fileType ? `&file_type=${searchReq.fileType}` : ""}
        ${searchReq.dir ? `&dir=${searchReq.dir}` : ""}
        `,
        method: "GET",
      }),
    }),
    show: builder.mutation<ShowResponse, ShowParams>({
      query: (showReq: ShowParams) => ({
        url: `/api/files?limit=${showReq.limit || 10}&offset=${
          showReq.offset || 0
        }`,
        method: "GET",
      }),
    }),
  }),
});

export const { useSearchMutation, useShowMutation } = searchAPi;
