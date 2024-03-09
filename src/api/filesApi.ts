// Import the RTK Query methods from the React-specific entry point
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Folder } from "@models/folder";

// Define our single @api slice object
export const filesApi = createApi({
  // The cache reducer expects to be added at `state.api` (already default - this is optional)
  reducerPath: "filesApi",
  // All of our requests will have URLs starting with '/fakeApi'
  baseQuery: fetchBaseQuery({
    baseUrl: "https://localhost:3000",
  }),
  // The "endpoints" represent operations and requests for this server
  endpoints: (builder) => ({
    getFolders: builder.mutation<Folder[], string>({
      query: (folderSearch: string) => ({
        url: `/files?_limit=5`,
        method: "GET",
      }),
    }),
  }),
});

// Export the auto-generated hook for the `getPosts` query endpoint
export const { useGetFoldersMutation } = filesApi;
