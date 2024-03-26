import DiskSVG from '@icons/disks/Disk.svg';
import GoogleSVG from '@icons/disks/Google.svg';
import YandexSVG from '@icons/disks/Yandex.svg';
import MonitorSVG from '@icons/disks/Monitor.svg';

import { Option } from '@models/additional';

import {
	OptionWithImg
} from '@models/additional';
import { MultiValue, SingleValue } from 'react-select';
import { SearchResponse, diskTypes, fileTypes, isFileType } from './searchParams';

export interface DiskType {
	src: string;
	altText: string;
}

export const diskImgSrc = new Map([
	[
		'google',
		{
			src: GoogleSVG,
			altText: 'text',
		},
	],
	[
		'yandex',
		{
			src: YandexSVG,
			altText: 'text',
		},
	],
	[
		'own',
		{
			src: DiskSVG,
			altText: 'text',
		},
	],
	[
		'local',
		{
			src: MonitorSVG,
			altText: 'text',
		},
	],
	[
		'all',
		{
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
		case 'local':
			return {
				label: 'local',
				value: 'local',
				imgSrc: MonitorSVG,
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
	newVal: MultiValue<OptionWithImg> | SingleValue<OptionWithImg>
): diskTypes[] => {
	if ('length' in newVal) {
		const diskValuesInString = newVal
			.map((val) => val.value)
			.filter((val) => val !== null) as diskTypes[];

		let newDiskValuesInString;
		if (!Array.isArray(diskValuesInString)) {
			newDiskValuesInString = [diskValuesInString];
		} else {
			newDiskValuesInString = diskValuesInString;
		}

		return newDiskValuesInString as diskTypes[];
	}
	if (newVal) {
		const diskType = newVal.value;
		if (diskType) {
			return [diskType] as diskTypes[];
		}
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
	newVal: MultiValue<Option> | SingleValue<Option> | OptionWithImg
): fileTypes[] => {
	if ('length' in newVal) {
		// @ts-expect-error Nothing will happen because isFileType 
		// checks on type of file 
		const diskValuesInString: fileTypes[] = newVal
			.filter((val) => isFileType(val.value))
			.filter((val) => val !== null)
			.map(val => val.value);

		let newDiskValuesInString;
		if (!Array.isArray(diskValuesInString)) {
			newDiskValuesInString = [diskValuesInString];
		} else {
			newDiskValuesInString = diskValuesInString;
		}

		return newDiskValuesInString.map((type) => type);
	}
	if (newVal) {
		if (isFileType(newVal.value)) {
			// @ts-expect-error  Nothing will happen because isFileType 
			// checks on type of file 
			return [newVal.value];
		}
	}

	return ['all' as fileTypes];
};

export const transformOptionsToDirs = (
	newVal: SingleValue<Option> | MultiValue<Option>
): string[] => {
	if ('length' in newVal) {
		return newVal.map((val) => val.value);
	}
	if (newVal) return [newVal.value];
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