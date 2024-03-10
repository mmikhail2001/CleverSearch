import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Folder } from "@models/folder";
import { DiskSearch, diskTypes, fileFile } from "@models/searchParams";

export const filesApi = createApi({
  reducerPath: "filesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8080/api/",
  }),
  endpoints: (builder) => ({
    getFolders: builder.mutation<fileFile[], string>({
      query: (folderSearch: string) => ({
        url: `/dirs?_query=${folderSearch}`,
        method: "POST",
        keepUnusedDataFor: 3,
      }),
    }),
    // TODO добавить directory current
    pushFile: builder.mutation<Folder[], FormData>({
      query: (formData: FormData) => ({
        url: `/files/upload`,
        method: "POST",
        body: formData,
        keepUnusedDataFor: 0,
      }),
    }),
    deleteFile: builder.mutation<Folder[], string[]>({
      query: (files: string[]) => ({
        url: `/files/delete`,
        method: "POST",
        body: {"files": files} ,
      }),
    }),
    createDir: builder.mutation<Folder[], string[]>({
      query: (dirPath: string[]) => ({
        url: `/dirs/create?dir_path="${dirPath.join('')}"`,
        method: "POST",
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
