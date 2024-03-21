import { DiskType, diskImgSrc } from '@models/disk';
import { switchToProcessed, switchToShow } from '@store/whatToShow';
import { Button } from '@entities/button/Button';
import { TextWithImg } from '@feature/textWithImg/textWithimg';
import React, { FC, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import './sidebar.scss';
import { ButtonWithInput } from '@feature/buttonWithInput/buttonWithInput';
import { useCreateDirMutation, usePushFileMutation } from '@api/filesApi';
import { useAppSelector } from '@store/store';
import { changeDir, changeDisk } from '@store/currentDirectoryAndDisk';
import { diskTypes, isDiskType } from '@models/searchParams';
import { useSearchMutation, useShowMutation } from '@api/searchApi';
import RobotSVG from '@icons/Robot.svg';
import DownloadSVG from '@icons/Download.svg';
import CleverSVG from '@icons/disks/Disk.svg';
import { useNavigate } from 'react-router-dom';
import { transfromToShowRequestString } from '@api/transforms';
import { debounce } from '@helpers/debounce'

interface SidebarProps { }

const getTextWithImg = (
	selected: boolean,
	disk: DiskType,
	text: string,
	setState: (text: diskTypes) => void,
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

	const { isSearch, isShow, isProccessed } = useAppSelector((state) => state.whatToShow);
	const { dirs, currentDisk } = useAppSelector((state) => state.currentDirDisk);
	const dispatch = useDispatch();
	const [search] = useSearchMutation({ fixedCacheKey: 'search' });
	const [show] = useShowMutation({ fixedCacheKey: 'show' });

	const navigate = useNavigate()

	const allDisks = Array.from(diskImgSrc.keys()).map((key) =>
		getTextWithImg(
			selectedField === key && isShow,
			diskImgSrc.get(key)!,
			key,
			(text) => {
				setSelectedField(text);
				if (!isShow) {
					dispatch(switchToShow());
					const url = transfromToShowRequestString({ limit: 10, offset: 0, disk: text })
					navigate(url)
				}

				dispatch(changeDisk(text));
			}
		)
	);

	const params = useAppSelector((state) => state.searchRequest);
	const [createDir] = useCreateDirMutation();

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
						} else if (isShow) {
							show({ limit: 10, offset: 0, disk: currentDisk, dir: dirs });
						}
					}, 300);
					Array.from(files).forEach((file) => {
						const formData = new FormData();

						formData.append('file', file, file.name);
						formData.append('dir', ['', ...dirs].join('/'));
						send(formData);
						debouncFunc();
					});
				}}
				disabled={false}
				variant={'filled'}
			></ButtonWithInput>
			<Button
				buttonText="Добавить папку"
				variant={'filled'}
				clickHandler={() => {
					const debounceFunc = debounce(() => {
						if (isSearch) {
							search(params);
						} else {
							show({ limit: 10, offset: 0, disk: currentDisk, dir: dirs });
						}
					}, 300);
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
				<TextWithImg
					text="Обрабатываются"
					className={['text-with-img', 'work-in-progress', isProccessed ? 'selected' : ''].join(' ')}
					imgSrc={RobotSVG}
					altImgText="Робот"
					onClick={() => {
						dispatch(switchToProcessed());
						dispatch(changeDisk('all'))
						navigate('/processed')
					}}
				/>
			</div>
		</div>
	);
};
