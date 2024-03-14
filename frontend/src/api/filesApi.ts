import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Folder } from '@models/folder';
import { fileFile } from '@models/searchParams';

export const filesApi = createApi({
	reducerPath: 'filesApi',
	baseQuery: fetchBaseQuery({
		baseUrl: `${process.env.protocol}://${process.env.adress}/api/`,
	}),
	endpoints: (builder) => ({
		getFolders: builder.mutation<fileFile[], string>({
			query: (folderSearch: string) => ({
				url: `/dirs?_query=${folderSearch}`,
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
				body: {'files': files} ,
			}),
		}),
		createDir: builder.mutation<Folder[], string[]>({
			query: (dirPath: string[]) => ({
				url: `/dirs/create?dir_path=${dirPath.join('')}`,
				method: 'POST',
			}),
		}),
	}),
});

export const {
	useDeleteFileMutation,
	useGetFoldersMutation,
	usePushFileMutation,
	useCreateDirMutation
} = filesApi;
