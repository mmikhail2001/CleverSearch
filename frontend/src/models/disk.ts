import DiskSVG from '@icons/disks/Disk.svg';
import GoogleSVG from '@icons/disks/Google.svg';
import YandexSVG from '@icons/disks/Yandex.svg';
import MonitorSVG from '@icons/disks/Monitor.svg';

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
