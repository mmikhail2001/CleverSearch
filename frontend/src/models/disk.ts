import DiskSVG from '@icons/disks/Disk.svg';
import GoogleSVG from '@icons/disks/Google.svg';
import YandexSVG from '@icons/disks/Yandex.svg';
import MonitorSVG from '@icons/disks/Monitor.svg';

import { Option } from '@models/additional';

import {
	OptionWithImg
} from '@models/additional';
import { SearchResponse, fileTypes, isFileType } from './searchParams';

export type diskTypes = 'google' | 'yandex' | 'own' | 'all';

/** if text of diskType return true */
export const isDiskType = (text: string): boolean => {
	if (['google', 'yandex', 'own', 'all'].includes(text)) return true;
	return false;
};

// not check, if not correct return all
export const toDiskType = (text: string): diskTypes => {
	const diskTypeFound: diskTypes =
		['google', 'yandex', 'own', 'all']
			.find(val => val === text) as diskTypes
	if (diskTypeFound) return diskTypeFound;
	return 'all';
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
		'yandex',
		{
			diskName: 'yandex',
			src: YandexSVG,
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
		'all',
		{
			diskName: 'all',
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
		case 'all':
			return {
				label: 'all',
				value: 'all',
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


	return ['all'];
};


export const getFilesTypesToOptions = (): Option[] => {
	return [
		{
			label: 'Изображение',
			value: 'img',
		},
		{
			label: 'Текст',
			value: 'text',
		},
		{
			label: 'Видео',
			value: 'video',
		},
		{
			label: 'Аудио',
			value: 'audio',
		},
	];
};

export const getFilesOptionFromValue = (value: string): Option => {
	switch (value) {
		case 'img':
			return {
				label: 'Изображение',
				value: 'img',
			}
		case 'video':
			return {
				label: 'Видео',
				value: 'video',
			}
		case 'audio':
			return {
				label: 'Аудио',
				value: 'audio',
			}
		case 'text':
			return {
				label: 'Текст',
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

	return ['all' as fileTypes];
};

export const transformOptionsToDirs = (
	newVal: string[]
): string[] => {
	if ('length' in newVal) {
		return newVal.map((val) => val);
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