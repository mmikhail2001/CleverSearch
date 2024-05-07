import DiskSVG from '@icons/disks/Disk.svg';
import GoogleSVG from '@icons/disks/Google.svg';
import YandexSVG from '@icons/disks/Yandex.svg';
import MonitorSVG from '@icons/disks/Monitor.svg';

import { Option } from '@models/additional';

import {
	OptionWithImg
} from '@models/additional';
import { SearchResponse, fileTypes, isFileType } from './searchParams';

export type diskTypes = 'google' | 'yandex' | 'own' | 'internal';

/** if text of diskType return true */
export const isDiskType = (text: string): text is diskTypes => {
	if (['google', 'yandex', 'own', 'internal'].includes(text)) return true;
	return false;
};

// not check, if not correct return all
export const toDiskType = (text: string): diskTypes => {
	const diskTypeFound: diskTypes =
		['google', 'yandex', 'own', 'internal']
			.find(val => val === text) as diskTypes
	if (diskTypeFound) return diskTypeFound;
	return 'internal';
}

export interface DiskType {
	diskName: string,
	src: string;
	altText: string;
}

export const diskImgSrc = new Map([
	[
		'google',
		{
			diskName: 'google',
			src: GoogleSVG,
			altText: 'text',
		},
	],
	[
		'own',
		{
			diskName: 'own',
			src: DiskSVG,
			altText: 'text',
		},
	],
	[
		'internal',
		{
			diskName: 'internal',
			src: MonitorSVG,
			altText: 'text',
		}
	]
]);

// TODO maybe another file?

export const getDisksToOptions = (): OptionWithImg[] => {
	const keys = Array.from(diskImgSrc.keys());
	const result: OptionWithImg[] = Array.from(
		keys.map((key) => {
			return { label: key, value: key, imgSrc: diskImgSrc.get(key)?.src || '' };
		})
	);

	if (result && result.length !== 0) {
		return result;
	}
	return [{ label: '', value: '', imgSrc: '' }];
};

export const diskValueToOption = (value: diskTypes): OptionWithImg => {
	switch (value) {
		case 'google':
			return {
				label: 'google',
				value: 'google',
				imgSrc: GoogleSVG,
			}
		case 'yandex':
			return {
				label: 'yandex',
				value: 'yandex',
				imgSrc: YandexSVG,
			}
		case 'own':
			return {
				label: 'own',
				value: 'own',
				imgSrc: DiskSVG,
			}
		case 'internal':
			return {
				label: 'internal',
				value: 'internal',
				imgSrc: MonitorSVG,
			}
	}
}

export const diskVal = (
	newVal: string[] | string
): diskTypes[] => {
	if (typeof newVal === 'string') {
		if (newVal) {
			return [newVal] as diskTypes[];
		}
	}
	if (newVal && Array.isArray(newVal)) {
		const diskValuesInString = newVal

		let newDiskValuesInString;
		if (!Array.isArray(diskValuesInString)) {
			newDiskValuesInString = [diskValuesInString];
		} else {
			newDiskValuesInString = diskValuesInString;
		}

		return newDiskValuesInString as diskTypes[];
	}


	return ['internal'];
};


export const getFilesTypesToOptions = (): Option[] => {
	return [
		{
			label: 'Image',
			value: 'img',
		},
		{
			label: 'Text',
			value: 'text',
		},
		{
			label: 'Video',
			value: 'video',
		},
		{
			label: 'Audio',
			value: 'audio',
		},
	];
};

export const getFilesOptionFromValue = (value: string): Option => {
	switch (value) {
		case 'img':
			return {
				label: 'Image',
				value: 'img',
			}
		case 'video':
			return {
				label: 'Video',
				value: 'video',
			}
		case 'audio':
			return {
				label: 'Audio',
				value: 'audio',
			}
		case 'text':
			return {
				label: 'Text',
				value: 'text',
			}
	}
}

export const fileValues = (
	newVal: string[]
): fileTypes[] => {
	if ('length' in newVal) {
		// @ts-expect-error Nothing will happen because isFileType 
		// checks on type of file 
		const diskValuesInString: fileTypes[] = newVal
			.filter((val) => isFileType(val))
			.filter((val) => val !== null)
			.map(val => val);

		let newDiskValuesInString;
		if (!Array.isArray(diskValuesInString)) {
			newDiskValuesInString = [diskValuesInString];
		} else {
			newDiskValuesInString = diskValuesInString;
		}

		return newDiskValuesInString.map((type) => type);
	}
	if (newVal) {
		if (isFileType(newVal)) {
			// @ts-expect-error  Nothing will happen because isFileType 
			// checks on type of file 
			return [newVal.value];
		}
	}

	return ['internal' as fileTypes];
};

export const transformOptionsToDirs = (
	newVal: string[]
): string[] => {
	if ('length' in newVal) {
		return newVal.length === 1 && newVal[0] === '/' 
		? [] 
		: newVal.map((val) => val)
	}
	if (newVal) return [newVal];
	return [];
};

export const transformToOptions = (folders: SearchResponse): Option[] => {
	return folders.body.map((folder) => {
		const splitPath = folder.path.split('/')
		return {
			label: String(splitPath[splitPath.length - 1]),
			value: String(folder.path),
		};
	});
};

export interface DiskConnectResp {
	redirect: string;
}
