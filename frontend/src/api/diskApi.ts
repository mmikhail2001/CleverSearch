import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { DiskConnectResp, diskTypes } from '@models/disk';

export const diskApi = createApi({
    reducerPath: 'diskApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${process.env.protocol}://${process.env.adress}/api/clouds/connect`,
    }),
    endpoints: (builder) => ({
        diskLinkConnect: builder.mutation<DiskConnectResp, diskTypes>({
            query: (disk: diskTypes) => ({
                url: `?disk=${disk}`,
                method: 'POST',
            }),
        }),
    }),
});

export const {
    useDiskLinkConnectMutation
} = diskApi;
