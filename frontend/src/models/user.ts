import { diskTypes } from "./disk";

export interface ConnectedClouds {
	cloud_email: string,
	disk: diskTypes,
}

export interface UserProfileResponse {
	id: string,
	email: string,
	connected_clouds: ConnectedClouds[]
}
