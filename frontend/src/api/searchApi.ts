import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
	SearchParams,
	SearchResponse,
	SharedUUIDResponse,
	ShowParams,
	ShowResponse,
} from '@models/searchParams';
import { transformToSearchRequestString } from './transforms'

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
		
		showSharedByID: builder.mutation<SharedUUIDResponse, string>({
			query: (dirUUID: string) => ({
				url: `files/${dirUUID}`,
				method: 'GET',
			}),
		}),
	
	}),
});

export const { 
	useSearchMutation, 
	useShowSharedByIDMutation,
} = searchAPi;
