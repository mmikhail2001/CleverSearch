import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { DiskConnectResp, diskTypes } from '@models/disk';
import { ConnectedClouds } from '@models/user';

export const diskApi = createApi({
    reducerPath: 'diskApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${process.env.protocol}://${process.env.adress}/api/clouds/`,
    }),
    endpoints: (builder) => ({
        diskLinkConnect: builder.mutation<DiskConnectResp, diskTypes>({
            query: (disk: diskTypes) => ({
                url: `connect?disk=${disk}`,
                method: 'POST',
            }),
        }),
        updateDisk: builder.mutation<null, ConnectedClouds>({
            query: (diskInfo: ConnectedClouds) => ({
                url: `refresh?disk=${diskInfo.disk}&cloud_email=${diskInfo.cloud_email}`,
                method: 'POST',
            }),
        }),
    }),
});

export const {
    useDiskLinkConnectMutation,
    useUpdateDiskMutation
} = diskApi;
