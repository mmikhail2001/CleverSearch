import { DiskType, diskImgSrc } from '@models/disk';
import { switchToShow } from '@store/whatToShow';
import { Button, Variants } from '@ui/button/Button';
import { TextWithImg } from '@ui/textWithImg/textWithimg';
import React, { FC, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import './sidebar.scss';
import { ButtonWithInput } from '@ui/buttonWithInput/buttonWithInput';
import { useCreateDirMutation, usePushFileMutation } from '@api/filesApi';
import { useAppSelector } from '@store/store';
import { changeDir, changeDisk } from '@store/currentDirectoryAndDisk';
import { diskTypes, isDiskType } from '@models/searchParams';
import { useSearchMutation, useShowMutation } from '@api/searchApi';
import RobotSVG from '@icons/Robot.svg';
import DownloadSVG from '@icons/Download.svg';
import CleverSVG from '@icons/disks/Disk.svg';

interface SidebarProps { }

const getTextWithImg = (
	selected: boolean,
	disk: DiskType,
	text: string,
	setState: (text: diskTypes) => void
) => {
	const { src, altText } = disk;

	return (
		<TextWithImg
			key={text + src}
			className={selected ? 'selected' : ''}
			text={text}
			imgSrc={src}
			altImgText={altText}
			onClick={() => {
				if (isDiskType(text)) {
					setState(text as diskTypes);
				}
			}}
		/>
	);
};

export const Sidebar: FC<SidebarProps> = () => {
	const [selectedField, setSelectedField] = useState(
		Array.from(diskImgSrc.keys())[4]
	);

	const { isSearch, isShow } = useAppSelector((state) => state.whatToShow);
	const { dirs, currentDisk } = useAppSelector((state) => state.currentDirDisk);
	const dispatch = useDispatch();
	const [search] = useSearchMutation({ fixedCacheKey: 'search' });
	const [show] = useShowMutation({ fixedCacheKey: 'show' });

	const allDisks = Array.from(diskImgSrc.keys()).map((key) =>
		getTextWithImg(
			selectedField === key && !isSearch,
			diskImgSrc.get(key)!,
			key,
			(text) => {
				setSelectedField(text);
				if (!isShow) {
					dispatch(switchToShow());
				}
				dispatch(changeDisk(text));
			}
		)
	);
	const params = useAppSelector((state) => state.searchRequest);

	const [createDir] = useCreateDirMutation();

	const debounce = (func: () => void, delay: number) => {
		let debounceHandler: NodeJS.Timeout;
		return function () {
			clearTimeout(debounceHandler);
			debounceHandler = setTimeout(() => {
				func();
			}, delay);
		};
	};

	useEffect(() => {
		if (isShow) {
			dispatch(changeDir({ dirs: [] }));
			show({ limit: 10, offset: 0, disk: currentDisk, dir: dirs });
		}
	}, [currentDisk]);

	const [send] = usePushFileMutation();
	return (
		<div className="sidebar">
			<div className="our-name-place">
				<TextWithImg
					onClick={() => dispatch(switchToShow())}
					text="CleverSearch"
					className="our-name"
					imgSrc={CleverSVG}
					altImgText="our-logo"
				/>
			</div>
			<ButtonWithInput
				buttonText="Добавить"
				onChange={(files: FileList) => {
					const debouncFunc = debounce(() => {
						if (isSearch) {
							search(params);
						} else {
							show({ limit: 10, offset: 0, disk: currentDisk, dir: dirs });
						}
					}, 100);
					Array.from(files).forEach((file) => {
						const formData = new FormData();

						formData.append('file', file, file.name);
						formData.append('dir', dirs.join('/'));
						send(formData);
						debouncFunc();
					});
				}}
				disabled={false}
				variant={Variants.filled}
			></ButtonWithInput>
			<Button
				buttonText="Добавить папку"
				variant={Variants.filled}
				clickHandler={() => {
					const debounceFunc = debounce(() => {
						if (isSearch) {
							search(params);
						} else {
							show({ limit: 10, offset: 0, disk: currentDisk, dir: dirs });
						}
					}, 100);
					createDir(dirs.concat('Папка'));
					debounceFunc();
				}}
			/>
			<div className="disk-show">
				<h2 className="disk-show-label">Ваши диски</h2>
				<div className="disks">{allDisks}</div>
			</div>
			<div className="under-disks">
				<TextWithImg
					text="Загружаются"
					className="downloading"
					imgSrc={DownloadSVG}
					altImgText="Загрузка"
				/>
				{/*TODO  изменить на другой элемент*/}
				<div
					className={['text-with-img', 'work-in-progress'].join(' ')}
					onClick={() => console.log('TODO')}
				>
					<img
						className="text-image"
						src={
							RobotSVG
						}
						alt={'Робот'}
					></img>
					<div className="container-text">
						<p className="text big-text">{'Обрабатываются'}</p>
						<p className="text small-text">{'для умного поиска'}</p>
					</div>
				</div>
			</div>
		</div>
	);
};
