import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Folder } from '@models/folder';
import { SearchResponse, ShareRequest, ShareResponse, fileFile } from '@models/searchParams';

export const filesApi = createApi({
	reducerPath: 'filesApi',
	baseQuery: fetchBaseQuery({
		baseUrl: `${process.env.protocol}://${process.env.adress}/api/`,
	}),
	endpoints: (builder) => ({
		getFolders: builder.mutation<SearchResponse, string>({
			query: (folderSearch: string) => ({
				url: `files?query=${folderSearch}&dir=/&disk=all&limit=20&offset=0&files_required=false&dirs_required=true`,
				method: 'GET',
			}),
		}),
		pushFile: builder.mutation<fileFile, FormData>({
			query: (formData: FormData) => ({
				url: '/files/upload',
				method: 'POST',
				body: formData,
			}),
		}),
		deleteFile: builder.mutation<Folder[], string[]>({
			query: (files: string[]) => ({
				url: '/files/delete',
				method: 'POST',
				body: { 'files': files },
			}),
		}),
		createDir: builder.mutation<Folder[], string[]>({
			query: (dirPath: string[]) => ({
				url: `/dirs/create?dir_path=${['', ...dirPath].join('/')}`,
				method: 'POST',
			}),
		}),
		getShareUrl: builder.mutation<ShareResponse, ShareRequest>({
			query: (request: ShareRequest) => ({
				url: '/dirs/share',
				method: 'POST',
				body: request
			}),
		}),
	}),
});

export const {
	useDeleteFileMutation,
	useGetFoldersMutation,
	usePushFileMutation,
	useCreateDirMutation,
	useGetShareUrlMutation
} = filesApi;
