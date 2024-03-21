import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
	SearchParams,
	SearchResponse,
	ShowParams,
	ShowResponse,
} from '@models/searchParams';
import { transformToSearchRequestString, transfromToShowRequestString } from './transforms'

export const searchAPi = createApi({
	reducerPath: 'searchAPi',

	baseQuery: fetchBaseQuery({
		baseUrl: `${process.env.protocol}://${process.env.adress}/api/`,
	}),
	endpoints: (builder) => ({
		// TODO limit offset
		search: builder.mutation<SearchResponse, SearchParams>({
			query: (searchReq: SearchParams) => ({
				url: transformToSearchRequestString(searchReq),
				method: 'GET',
			}),
		}),
		show: builder.mutation<ShowResponse, ShowParams>({
			query: (showReq: ShowParams) => ({
				url: transfromToShowRequestString(showReq),
				method: 'GET',
			}),
		}),
	}),
});

export const { useSearchMutation, useShowMutation } = searchAPi;
