import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Folder, FolderResp } from '@models/folder';
import { SearchResponse, ShareRequest, ShareResponse } from '@models/searchParams';
import {DriveReq, fileFile} from '@models/files'

export const filesApi = createApi({
	reducerPath: 'filesApi',
	baseQuery: fetchBaseQuery({
		baseUrl: `${process.env.protocol}://${process.env.adress}/api/`,
	}),
	endpoints: (builder) => ({
		createDir: builder.mutation<FolderResp, string[]>({
			query: (dirPath: string[]) => ({
				url: `/dirs/create?dir_path=${['', ...dirPath].join('/')}`,
				method: 'POST',
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

		getShareUrl: builder.mutation<ShareResponse, ShareRequest>({
			query: (request: ShareRequest) => ({
				url: '/dirs/share',
				method: 'POST',
				body: request
			}),
		}),

		addToFavourite: builder.mutation<ShareResponse, string>({
			query: (id: string) => ({
				url: `/files/favs/add/${id}`,
				method: 'POST',
			}),
		}),

		deleteToFavourite: builder.mutation<ShareResponse, string>({
			query: (id: string) => ({
				url: `/files/favs/delete/${id}`,
				method: 'POST',
			}),
		}),

		getFavourite: builder.mutation<SearchResponse, null>({
			query: () => ({
				url: '/files/favs',
				method: 'GET',
			}),
		}),

		getUploadedFiles: builder.mutation<SearchResponse, null>({
			query: () => ({
				url: `/v2/files/uploaded`,
				method: 'GET',
			}),
		}),

		getSharedFiles: builder.mutation<SearchResponse, string>({
			query: (dir:string) => ({
				url: `/v2/files/shared?dir=/${dir}`,
				method: 'GET',
			}),
		}),

		getDriveFiles: builder.mutation<SearchResponse, DriveReq>({
			query: (request:DriveReq) => ({
				url: `/v2/files/drive?dir=/${request.dir}&cloud_email=${request.email}`,
				method: 'GET',
			}),
		}),

		getInternalFiles: builder.mutation<SearchResponse, string>({
			query: (dir:string) => ({
				url: `/v2/files/internal?dir=/${dir}`,
				method: 'GET',
			}),
		}),

		getDirs: builder.mutation<SearchResponse, string>({
			query: (query:string) => ({
				url: `/v2/files/dirs?query=${query}`,
				method: 'GET',
			}),
		}),
	}),
});

export const {
	useDeleteFileMutation,
	usePushFileMutation,
	useCreateDirMutation,
	useGetShareUrlMutation,
	useDeleteToFavouriteMutation,
	useAddToFavouriteMutation,
	useGetFavouriteMutation,
	useGetDirsMutation,
	useGetDriveFilesMutation,
	useGetInternalFilesMutation,
	useGetSharedFilesMutation,
	useGetUploadedFilesMutation,
} = filesApi;
