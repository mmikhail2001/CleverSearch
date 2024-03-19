import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
	SearchParams,
	SearchResponse,
	ShowParams,
	ShowResponse,
	fileTypes,
} from '@models/searchParams';

export const searchAPi = createApi({
	reducerPath: 'searchAPi',

	baseQuery: fetchBaseQuery({
		baseUrl: `${process.env.protocol}://${process.env.adress}/api/`,
	}),

	endpoints: (builder) => ({
		// TODO limit offset
		search: builder.mutation<SearchResponse, SearchParams>({
			query: (searchReq: SearchParams) => ({
				url: [`files/search?is_smart_search=${searchReq.smartSearch}`,
					`&query=${searchReq.query}`,
					`&disk=${searchReq.disk ? searchReq.disk : 'all'}`,
					`&file_type=${searchReq.fileType ? searchReq.fileType : 'all' as fileTypes}`,
					`&dir=${searchReq.dir ? searchReq.dir.join('/') : ''}`,
					`&limit=${searchReq.limit ? searchReq.limit : 10}`,
					`&offset=${searchReq.offset ? searchReq.offset : 0}`].join(''),
				method: 'GET',
			}),
		}),
		show: builder.mutation<ShowResponse, ShowParams>({
			query: (showReq: ShowParams) => ({
				url: [`/files?limit=${showReq.limit}`,
					`&offset=${showReq.offset}`,
					`${showReq.query ? `&query=${showReq.query}` : ''}`,
					`&disk=${showReq.disk ? showReq.disk : 'all'}`,
					`&file_type=${showReq.fileType ? showReq.fileType.join(',') : 'all' as fileTypes}`,
					`&dir=${showReq.dir && showReq.dir.length !== 0 ? showReq.dir.join('/') : '/'}`].join(''),
				method: 'GET',
			}),
		}),
	}),
});

export const { useSearchMutation, useShowMutation } = searchAPi;
