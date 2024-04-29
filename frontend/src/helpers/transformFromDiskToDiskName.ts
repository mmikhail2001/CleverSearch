import { ConnectedClouds } from '@models/user';
import { diskTypes } from '@models/disk';

export const transformFromDiskToDiskName = (disk: diskTypes | ConnectedClouds): string => {
	return typeof disk === 'string' ? disk : disk.disk
}