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
		baseUrl: `${process.env.protocol}://${process.env.adress}/`,
	}),
	endpoints: (builder) => ({
		// TODO limit offset
		search: builder.mutation<SearchResponse, SearchParams>({
			query: (searchReq: SearchParams) => ({
				url: `api/${transformToSearchRequestString(searchReq)}`,
				method: 'GET',
			}),
		}),
		
		showSharedByID: builder.mutation<SharedUUIDResponse, string>({
			query: (dirUUID: string) => ({
				url: `api/files/${dirUUID}`,
				method: 'GET',
			}),
		}),
		getShareFolderUUID: builder.mutation<SharedUUIDResponse, string>({
			query: (dirUUID: string) => ({
				url: `dirs/${dirUUID}?sharing=true`,
				method: 'GET',
			}),
		}),
	}),
});

export const { 
	useSearchMutation, 
	useShowSharedByIDMutation,
	useGetShareFolderUUIDMutation,
} = searchAPi;
