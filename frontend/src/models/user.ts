import { diskTypes } from './disk';

export interface ConnectedClouds {
	cloud_email: string,
	disk: diskTypes,
	access_token: string,
}

export const isConnectedClouds = (obj:any): obj is ConnectedClouds => {
	return typeof obj === 'object'
		&& 'cloud_email' in obj
		&& 'disk' in obj
		&& 'access_token' in obj
}

export interface UserProfileResponse {
	id: string,
	email: string,
	connected_clouds: ConnectedClouds[]
}

export interface EmailChecksResp {
	email: string,
	exists: boolean,
}