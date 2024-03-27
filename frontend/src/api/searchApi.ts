import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
	SearchParams,
	SearchResponse,
	SharedUUIDResponse,
	ShowParams,
	ShowResponse,
} from '@models/searchParams';
import { transformToSearchRequestString, transfromToSharedRequestParams, transfromToShowRequestString } from './transforms'

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
		showSharedByID: builder.mutation<SharedUUIDResponse, string>({
			query: (dirUUID: string) => ({
				url: `files/${dirUUID}`,
				method: 'GET',
			}),
		}),
		showShared: builder.mutation<ShowResponse, ShowParams>({
			query: (req: ShowParams) => ({
				url: `/files${transfromToSharedRequestParams(req)}`,
				method: 'GET',
			}),
		})
	}),
});

export const { useSearchMutation, useShowMutation, useShowSharedMutation, useShowSharedByIDMutation } = searchAPi;
