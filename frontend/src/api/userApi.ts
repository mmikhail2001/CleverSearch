import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { UserData } from '@models/userModels';
import { UserProfileResponse } from '@models/user'

export const userApi = createApi({
	reducerPath: 'userApi',

	baseQuery: fetchBaseQuery({
		baseUrl: `${process.env.protocol}://${process.env.adress}/api/users`,
	}),

	endpoints: (builder) => ({
		logout: builder.mutation<null, null>({
			query: () => ({
				url: '/logout',
				method: 'POST',
			}),
		}),

		login: builder.mutation({
			query: (body: UserData) => ({
				url: '/login',
				method: 'POST',
				body: body,
			}),
		}),

		register: builder.mutation({
			query: (body: UserData) => ({
				url: '/register',
				method: 'POST',
				body: body,
			}),
		}),
		setAvatar: builder.mutation<null,FormData>({
			query: (avatar: FormData) => ({
				url: `/avatars`,
				method: 'POST',
				body: avatar,
			}),
		}),

		profile: builder.query<UserProfileResponse, null>({ query: () => '/profile' }),
	}),
});

export const {
	useLazyProfileQuery,
	useProfileQuery,
	useLoginMutation,
	useRegisterMutation,
	useLogoutMutation,
	useSetAvatarMutation,
} = userApi;


export const getAvatarByEmail = (email:string):string => {
	return `${process.env.protocol}://${process.env.adress}/api/users/avatars/${email}`
}