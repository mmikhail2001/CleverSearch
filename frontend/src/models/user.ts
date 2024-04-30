import { diskTypes } from './disk';

export interface ConnectedClouds {
	cloud_email: string,
	disk: diskTypes,
	access_token: string,
}

export interface UserProfileResponse {
	id: string,
	email: string,
	connected_clouds: ConnectedClouds[]
}
